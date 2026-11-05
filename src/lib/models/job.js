import config from '#lib/data/config.json' with { type: 'json' };
import { distanceKm, travelMinutes } from './distance.js';
import { inPlace, remoteRegion } from './place.js';

/**
 * @typedef {import('#lib/ats/job.js').Job} Job
 * @typedef {'' | 'remote' | 'anywhere'} RemoteFilter
 *   remote: jobs done remotely; anywhere: remote jobs that name no country or region they are limited to.
 * @typedef {{query: string, where: string, remote: RemoteFilter, near?: [number, number] | null, within?: number}} JobFilters
 *   near: where the person is ([longitude, latitude]), to find jobs close by; never kept in the page address.
 *   within: at most that many minutes away (by the usual travel mode), 0 for any distance.
 */

const remoteWords = config.jobs.remoteWords;
const remoteText = new RegExp(`\\b(${remoteWords.join('|')})\\b`, 'i');
// In a title, only a marked remote counts: "Designer (Remote)", "Engineer – Remote", not "Remote Sensing Engineer".
const remoteTitle = new RegExp(`([(\\[|,]|\\s[-–]\\s)\\s*(${remoteWords.join('|')})\\b`, 'i');

/** @param {string} text */
const words = (text) => text.toLowerCase().split(/\s+/).filter(Boolean);

/**
 * Where the work happens: what the job board or the poster says, else what the location or title says.
 * @param {Job} job
 * @returns {'onsite' | 'hybrid' | 'remote' | undefined}
 */
export function workplace(job) {
	if (job.remote === 'onsite' || job.remote === 'hybrid' || job.remote === 'remote') return job.remote;
	if (remoteText.test(job.location || '') || remoteTitle.test(job.title)) return 'remote';
	if (/\bhybrid\b/i.test(`${job.location || ''} ${job.title}`)) return 'hybrid';
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
 * Whether a job is in the place someone typed. A remote job matches when its
 * limit is that place, or when it names no limit.
 * @param {Job} job
 * @param {string} where
 * @param {RemoteFilter} remote
 */
function matchesPlace(job, where, remote) {
	if (!where.trim()) return true;
	if (remote && !remoteLimit(job)) return true;
	return inPlace(job.location, where, isRemote(job));
}

/**
 * Jobs matching the filters, newest first. Near someone: only the jobs with a known place,
 * each with its distance, by travel time in bands (a few minutes more do not matter), newest first in each.
 * @param {Job[]} jobs
 * @param {JobFilters} filters
 * @param {Map<string, string>} names company names by key
 */
export function filterJobs(jobs, { query, where, remote, near, within = 0 }, names) {
	const what = words(query);
	const matching = jobs
		.filter((job) => {
			if (remote && !isRemote(job)) return false;
			if (remote === 'anywhere' && remoteLimit(job)) return false;
			if (!matchesPlace(job, where, remote)) return false;
			if (!what.length) return true;
			const text = `${job.title} ${job.department || ''} ${names.get(job.company) || ''}`.toLowerCase();
			return what.every((w) => text.includes(w));
		})
		.sort((a, b) => time(b.published) - time(a.published));
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
		const key = `${job.company}\n${job.title.trim().toLowerCase()}`;
		const kept = job.posted ? undefined : first.get(key);
		if (kept) {
			kept.also = [...(kept.also || []), job];
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
	return [...new Set([job, ...(job.also || [])].map((j) => j.location).filter(Boolean))];
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
	/** @type {Map<string, number>} */
	const counts = new Map();
	for (const job of jobs) {
		for (const part of (job.location || '').split(/[,;/|]/)) {
			const place = part.trim();
			if (place.length > 1) counts.set(place, (counts.get(place) || 0) + 1);
		}
	}
	return [...counts]
		.sort((a, b) => b[1] - a[1])
		.slice(0, limit)
		.map(([place]) => place);
}

/**
 * A sortable time, 0 when unknown.
 * @param {string | undefined} value
 */
export function time(value) {
	if (!value) return 0;
	const ms = Date.parse(String(value).replace(' UTC', 'Z').replace(' ', 'T'));
	return Number.isFinite(ms) ? ms : 0;
}
