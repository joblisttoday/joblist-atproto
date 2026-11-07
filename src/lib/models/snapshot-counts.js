import { offerCount, placeCounts } from './job.js';
import { offersIn } from './list-place.js';

/**
 * What the pages that only count jobs need, counted once by the indexer (counts.json):
 * the companies, lists and search box show them without reading every job.
 * @typedef {import('#lib/ats/job.js').Job} Job
 * @typedef {{offers: Record<string, number>, places: [string, number][], here: Record<string, Record<string, number>>}} CountsFile
 *   offers: open offers by company key (see offerCount);
 *   places: the places named most in jobs, with how many jobs (see placeCounts);
 *   here: for each place lists are about (see listPlace), by placesKey, the offers there by company (none left out).
 * @typedef {{offers: Map<string, number>, places: [string, number][], here: Map<string, Map<string, number>>}} Counts
 */

/**
 * The key of some places in `here`.
 * @param {string[]} places
 */
export const placesKey = (places) => places.join('\n');

/**
 * @param {Job[]} jobs the snapshot's job board jobs, as the app reads them (see fromSnapshot)
 * @param {string[][]} placeSets the places of each list about places
 * @param {number} placeLimit
 * @returns {CountsFile}
 */
export function countJobs(jobs, placeSets, placeLimit) {
	/** @type {Map<string, Job[]>} */
	const byCompany = new Map();
	for (const job of jobs) {
		const list = byCompany.get(job.company) || [];
		list.push(job);
		byCompany.set(job.company, list);
	}
	/** @type {Record<string, Record<string, number>>} */
	const here = {};
	for (const places of placeSets) {
		const key = placesKey(places);
		if (here[key]) continue;
		/** @type {Record<string, number>} */
		const counts = {};
		for (const [company, list] of byCompany) {
			const count = offersIn(list, places);
			if (count) counts[company] = count;
		}
		here[key] = counts;
	}
	return {
		offers: Object.fromEntries([...byCompany].map(([company, list]) => [company, offerCount(list)])),
		places: placeCounts(jobs, placeLimit),
		here
	};
}

/** @param {unknown} value */
const count = (value) => (Number.isFinite(Number(value)) ? Number(value) : 0);

/** @param {unknown} record */
const countMap = (record) => new Map(Object.entries(record && typeof record === 'object' ? record : {}).map(([key, n]) => [key, count(n)]));

/**
 * The counts file as the app uses it; null when it is not one.
 * @param {any} data
 * @returns {Counts | null}
 */
export function readCounts(data) {
	if (!data || typeof data.offers !== 'object' || !data.offers) return null;
	/** @type {unknown[]} */
	const places = Array.isArray(data.places) ? data.places : [];
	return {
		offers: countMap(data.offers),
		places: places.flatMap((p) => (Array.isArray(p) && typeof p[0] === 'string' ? [/** @type {[string, number]} */ ([p[0], count(p[1])])] : [])),
		here: new Map(Object.entries(data.here && typeof data.here === 'object' ? data.here : {}).map(([key, counts]) => [key, countMap(counts)]))
	};
}
