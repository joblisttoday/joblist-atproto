import config from '#lib/data/config.json' with { type: 'json' };
import { distanceKm, inArea, travelMinutes } from './distance.js';
import { placeMatcher, remoteRegion } from './place.js';
import { placeParts } from './place-names.js';
import { fieldsOf } from './landing.js';
import { teamOf } from './team.js';

/**
 * @typedef {import('#lib/ats/job.js').Job} Job
 * @typedef {'' | 'remote' | 'anywhere'} RemoteFilter
 *   remote: jobs done remotely; anywhere: remote jobs that name no country or region they are limited to.
 * @typedef {[[number, number], [number, number]]} Area [[west, south], [east, north]]
 * @typedef {{query: string, where: string, remote: RemoteFilter, pay?: boolean, field?: string, team?: string, near?: [number, number] | null, within?: number, area?: Area | null, places?: string[]}} JobFilters
 *   pay: only the jobs whose board says what they pay. field: only those of a field (data/fields.json: engineering, design…).
 *   team: only those of a team, on an organization's page (models/team.js).
 *   places: only the jobs in one of them, as for `where` (a list about places: "Paris & Lyon").
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
 * '' is "read already, not said".
 * @param {Job} job
 * @returns {'onsite' | 'hybrid' | 'remote' | undefined}
 */
export function workplace(job) {
	if (job.remote === 'onsite' || job.remote === 'hybrid' || job.remote === 'remote') return job.remote;
	if (job.remote === '') return undefined;
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
export function filterJobs(jobs, { query, where, remote, pay, field, team, near, within = 0, area, places }, names) {
	const what = words(query);
	const place = where.trim() ? placeMatcher(where) : null;
	const among = places?.length ? places.map(placeMatcher) : null;
	const matching =
		!what.length && !place && !among && !remote && !pay && !field && !team && !area
			? jobs
			: jobs.filter((job) => {
					if (pay && !job.salary) return false;
					if (field && !fieldsOf({ t: job.title, d: job.department }).includes(field)) return false;
					if (team && teamOf(job) !== team) return false;
					if (area && !(job.point && inArea(job.point, area))) return false;
					if (remote && !isRemote(job)) return false;
					if (remote === 'anywhere' && remoteLimit(job)) return false;
					if (place && !(remote && !remoteLimit(job)) && !place(job.location, isRemote(job))) return false;
					if (among && !(remote && !remoteLimit(job)) && !among.some((p) => p(job.location, isRemote(job)))) return false;
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
	const keys = jobs.map((job) => (job.posted ? '' : offerKey(job)));
	/** @type {Map<string, Job[]>} */
	const groups = new Map();
	jobs.forEach((job, i) => {
		if (!keys[i]) return;
		const group = groups.get(keys[i]);
		if (group) group.push(job);
		else groups.set(keys[i], [job]);
	});
	/** @type {Job[]} */
	const out = [];
	jobs.forEach((job, i) => {
		if (!keys[i]) return void out.push(job);
		const group = /** @type {Job[]} */ (groups.get(keys[i]));
		// Only an offer in several places is a new job (most are one): the jobs given are never changed.
		if (group[0] === job) out.push(group.length > 1 ? { ...job, also: group.slice(1) } : job);
	});
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
 * Jobs taking turns between companies: each company's `per` first jobs, then their next
 * `per`, and so on, each round in the order given (newest first). A company publishing
 * fifty jobs on one day then shows two among the others', not fifty in a row; none is left out.
 * @template {object} T
 * @param {T[]} jobs
 * @param {number} per 0: the order given
 * @param {(job: T) => string} [companyOf] its company's key (the snapshot's jobs: `c`)
 * @returns {T[]}
 */
export function spread(jobs, per, companyOf = (job) => /** @type {any} */ (job).company) {
	if (!per) return jobs;
	/** @type {Map<string, number>} */
	const counted = new Map();
	/** @type {T[][]} */
	const rounds = [];
	for (const job of jobs) {
		const company = companyOf(job);
		const n = counted.get(company) || 0;
		counted.set(company, n + 1);
		(rounds[Math.floor(n / per)] ??= []).push(job);
	}
	return rounds.flat();
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
	const text = String(value);
	const ms = Date.parse(text.includes(' ') ? text.replace(' UTC', 'Z').replace(' ', 'T') : text);
	return Number.isFinite(ms) ? ms : 0;
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

/** What a job is searched by, made once per job. */
const searchTexts = new WeakMap();

/**
 * Reads a job for searches ahead of time (while the page is idle): the first search then only compares.
 * @param {Job} job
 * @param {Map<string, string>} names company names by key
 */
export function prepareJob(job, names) {
	searchText(job, names);
}

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
	// Positions are sorted, by dates read into a plain array: much faster than comparing jobs
	// (tens of thousands on a phone), and runs already in order (each company's) are kept.
	const times = jobs.map((job) => time(job.published));
	const order = Array.from(jobs.keys()).sort((a, b) => times[b] - times[a] || a - b);
	const sorted = order.map((i) => jobs[i]);
	for (let i = 0; i < sorted.length; i++) jobs[i] = sorted[i];
}

/**
 * Jobs newest first, from jobs in that order already and a few others: only the few
 * are sorted, then each is placed among the others (after those of its time).
 * The same jobs as newestFirst([...sorted, ...others]), in a new list.
 * @param {Job[]} sorted newest first
 * @param {Job[]} others
 */
export function placeNewest(sorted, others) {
	const few = [...others];
	newestFirst(few);
	const out = [];
	let from = 0;
	for (const job of few) {
		const at = time(job.published);
		// The first of the sorted jobs older than it (dates read only where looked).
		let low = from;
		let high = sorted.length;
		while (low < high) {
			const mid = (low + high) >> 1;
			if (time(sorted[mid].published) >= at) low = mid + 1;
			else high = mid;
		}
		for (let i = from; i < low; i++) out.push(sorted[i]);
		out.push(job);
		from = low;
	}
	for (let i = from; i < sorted.length; i++) out.push(sorted[i]);
	return out;
}

/**
 * What makes two jobs the same offer (made each time: faster than keeping it for tens of thousands of jobs).
 * @param {Job} job
 */
export function offerKey(job) {
	return `${job.company}\n${job.title.trim().toLowerCase()}`;
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
