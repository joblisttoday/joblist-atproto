import config from '#lib/data/config.json' with { type: 'json' };
import { distanceKm, inArea, travelMinutes } from './distance.js';
import { placeMatcher, remoteRegion } from './place.js';
import { placeParts } from './place-names.js';

/**
 * @typedef {import('#lib/ats/job.js').Job} Job
 * @typedef {'' | 'remote' | 'anywhere'} RemoteFilter
 *   remote: jobs done remotely; anywhere: remote jobs that name no country or region they are limited to.
 * @typedef {[[number, number], [number, number]]} Area [[west, south], [east, north]]
 * @typedef {{query: string, where: string, remote: RemoteFilter, pay?: boolean, near?: [number, number] | null, within?: number, area?: Area | null}} JobFilters
 *   pay: only the jobs whose board says what they pay.
 *   near: where the person is ([longitude, latitude]), to find jobs close by; never kept in the page address.
 *   area: only the jobs in it (the part of the map someone looks at).
 *   within: at most that many minutes away (by the usual travel mode), 0 for any distance.
 */

const remoteWords = config.jobs.remoteWords;
const remoteText = new RegExp(`\\b(${remoteWords.join('|')})\\b`, 'i');
// In a title, only a marked remote counts: "Designer (Remote)", "Engineer – Remote", not "Remote Sensing Engineer".
const remoteTitle = new RegExp(`([(\\[|,]|\\s[-–]\\s)\\s*(${remoteWords.join('|')})\\b`, 'i');
const hybridText = new RegExp(`\\b(${config.jobs.hybridWords.join('|')})\\b`, 'i');
const hybridTitle = new RegExp(`([(\\[|,]|\\s[-–]\\s)\\s*(${config.jobs.hybridWords.join('|')})\\b`, 'i');
const onsiteText = new RegExp(`\\b(${config.jobs.onsiteWords.join('|')})\\b`, 'i');

/** @param {string} text */
const words = (text) => text.toLowerCase().split(/\s+/).filter(Boolean);

/**
 * Where the work happens: what the job board or the poster says, else what the location
 * or title says ("Remote - USA", "Berlin (Hybrid)"; on site only from the location).
 * @param {Job} job
 * @returns {'onsite' | 'hybrid' | 'remote' | undefined}
 */
export function workplace(job) {
	if (job.remote === 'onsite' || job.remote === 'hybrid' || job.remote === 'remote') return job.remote;
	if (remoteText.test(job.location || '') || remoteTitle.test(job.title)) return 'remote';
	if (hybridText.test(job.location || '') || hybridTitle.test(job.title)) return 'hybrid';
	if (onsiteText.test(job.location || '')) return 'onsite';
	return undefined;
}

/** @param {Job} job */
export function isRemote(job) {
	return workplace(job) === 'remote';
}

/**
 * The place a remote job is limited to ("united states" for "Remote - USA"), '' when it names none.
 * @param {Job} job
 */
export function remoteLimit(job) {
	return isRemote(job) ? remoteRegion(job.location, remoteWords) : '';
}

/**
 * Jobs matching the filters, in the order given (see newestFirst). A remote job is in
 * the place typed when its limit is that place, or when it names no limit.
 * Near someone: only the jobs with a known place, each with its distance, by travel
 * time in bands (a few minutes more do not matter), newest first in each.
 * No filter: the same jobs, not a copy.
 * @param {Job[]} jobs
 * @param {JobFilters} filters
 * @param {Map<string, string>} names company names by key
 */
export function filterJobs(jobs, { query, where, remote, pay, near, within = 0, area }, names) {
	const what = words(query);
	const place = where.trim() ? placeMatcher(where) : null;
	const matching =
		!what.length && !place && !remote && !pay && !area
			? jobs
			: jobs.filter((job) => {
					if (pay && !job.salary) return false;
					if (area && !(job.point && inArea(job.point, area))) return false;
					if (remote && !isRemote(job)) return false;
					if (remote === 'anywhere' && remoteLimit(job)) return false;
					if (place && !(remote && !remoteLimit(job)) && !place(job.location, isRemote(job))) return false;
					if (!what.length) return true;
					const text = searchText(job, names);
					return what.every((w) => text.includes(w));
				});
	if (!near) return matching;
	return matching
		.filter((job) => job.point)
		.map((job) => ({ ...job, km: distanceKm(near, /** @type {[number, number]} */ (job.point)) }))
		.filter((job) => !within || travelMinutes(job.km) <= within)
		.sort((a, b) => band(a.km) - band(b.km) || time(b.published) - time(a.published) || a.km - b.km);
}

/** @param {number} km */
function band(km) {
	return Math.floor(travelMinutes(km) / config.travel.bandMinutes);
}

/**
 * One job per offer: a company posting the same title for several places
 * ("Frontend Engineer" in Sweden, in Nigeria…) gets one job, the first,
 * with the others in `also`. Order is kept; posted offers are never merged.
 * @param {Job[]} jobs
 * @returns {Job[]}
 */
export function sameOffers(jobs) {
	/** @type {Map<string, Job>} */
	const first = new Map();
	/** @type {Job[]} */
	const out = [];
	for (const job of jobs) {
		const key = offerKey(job);
		const kept = job.posted ? undefined : first.get(key);
		if (kept) {
			// Added to, not copied: an employer may have hundreds of the same offer.
			(kept.also ||= []).push(job);
			continue;
		}
		const copy = { ...job, also: undefined };
		if (!job.posted) first.set(key, copy);
		out.push(copy);
	}
	return out;
}

/**
 * Every place of an offer, once: its own and those of the same offer elsewhere.
 * @param {Job} job
 */
export function offerPlaces(job) {
	return [...new Set([job, ...(job.also || [])].map((j) => tidyPlace(j.location)).filter(Boolean))];
}

/**
 * A place without its repeated parts: "Berlin, Berlin, Germany" → "Berlin, Germany".
 * @param {string | undefined} place
 */
export function tidyPlace(place) {
	const seen = new Set();
	return (place || '')
		.split(/\s*,\s*/)
		.filter((part) => part && !seen.has(part.toLowerCase()) && seen.add(part.toLowerCase()))
		.join(', ');
}

/**
 * Jobs grouped by company, biggest group first.
 * @param {Job[]} jobs
 * @returns {[string, Job[]][]}
 */
export function byCompany(jobs) {
	/** @type {Map<string, Job[]>} */
	const groups = new Map();
	for (const job of jobs) {
		const group = groups.get(job.company) || [];
		group.push(job);
		groups.set(job.company, group);
	}
	return [...groups].sort((a, b) => b[1].length - a[1].length);
}

/**
 * The most frequent places in job locations, to suggest as filters.
 * @param {Job[]} jobs
 * @param {number} [limit]
 */
export function commonPlaces(jobs, limit = config.jobs.placesSuggested) {
	return placeCounts(jobs, limit).map(([place]) => place);
}

/**
 * The places named most in jobs, with how many jobs name them. Spellings of the same
 * place count together ("CA" and "California", "USA" and "United States"), under the
 * most used one; work-place words ("Remote", "Hybrid") are not places.
 * @param {Job[]} jobs
 * @param {number} limit
 * @returns {[string, number][]}
 */
export function placeCounts(jobs, limit) {
	// Far fewer locations than jobs: each is read once.
	/** @type {Map<string, number>} */
	const locations = new Map();
	for (const job of jobs) locations.set(job.location || '', (locations.get(job.location || '') || 0) + 1);
	/** @type {Map<string, {count: number, names: Map<string, number>}>} */
	const counts = new Map();
	for (const [location, jobCount] of locations) {
		const seen = new Set();
		for (const { key, name } of placeParts(location)) {
			if (seen.has(key)) continue;
			seen.add(key);
			const place = counts.get(key) || { count: 0, names: new Map() };
			place.count += jobCount;
			place.names.set(name, (place.names.get(name) || 0) + jobCount);
			counts.set(key, place);
		}
	}
	return [...counts.values()]
		.sort((a, b) => b.count - a.count)
		.slice(0, limit)
		.map(({ count, names }) => [[...names].reduce((a, b) => (b[1] > a[1] ? b : a))[0], count]);
}

/**
 * A sortable time, 0 when unknown.
 * @param {string | undefined} value
 */
export function time(value) {
	if (!value) return 0;
	const key = String(value);
	let ms = times.get(key);
	if (ms === undefined) {
		ms = Date.parse(key.includes(' ') ? key.replace(' UTC', 'Z').replace(' ', 'T') : key);
		if (!Number.isFinite(ms)) ms = 0;
		times.set(key, ms);
	}
	return ms;
}

/**
 * Whether a job board offer was first seen more than `days` ago: still listed,
 * but maybe filled. Shown as such, never hidden (offers posted on joblist expire instead).
 * @param {Job} job
 * @param {number} [now]
 * @param {number} [days]
 */
export function isOlder(job, now = Date.now(), days = config.jobs.olderDays) {
	const at = time(job.published);
	return !job.posted && at > 0 && now - at > days * 864e5;
}

/** Dates already read: sorting tens of thousands of jobs reads each many times. */
const times = new Map();

/** What a job is searched by, made once per job. */
const searchTexts = new WeakMap();

/**
 * @param {Job} job
 * @param {Map<string, string>} names
 */
function searchText(job, names) {
	let text = searchTexts.get(job);
	if (text === undefined) {
		text = `${job.title} ${job.department || ''} ${names.get(job.company) || ''}`.toLowerCase();
		searchTexts.set(job, text);
	}
	return text;
}

/**
 * Sort jobs newest first, in place, reading each date once
 * (a sort compares each job many times). Done once on all jobs: filtering keeps the order.
 * @param {Job[]} jobs
 */
export function newestFirst(jobs) {
	const times = new Map(jobs.map((job) => [job, time(job.published)]));
	jobs.sort((a, b) => /** @type {number} */ (times.get(b)) - /** @type {number} */ (times.get(a)));
}

/** What makes two jobs the same offer, made once per job. @type {WeakMap<Job, string>} */
const offerKeys = new WeakMap();
/** @param {Job} job */
export function offerKey(job) {
	let key = offerKeys.get(job);
	if (key === undefined) {
		key = `${job.company}\n${job.title.trim().toLowerCase()}`;
		offerKeys.set(job, key);
	}
	return key;
}

/**
 * How many offers some jobs are (see sameOffers), without making them.
 * @param {Job[]} jobs
 */
export function offerCount(jobs) {
	const keys = new Set();
	let posted = 0;
	for (const job of jobs) job.posted ? posted++ : keys.add(offerKey(job));
	return keys.size + posted;
}
