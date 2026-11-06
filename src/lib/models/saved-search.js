import { filterJobs, sameOffers, time } from './job.js';

/**
 * A job search someone keeps: its filters, and when they last looked at its jobs.
 * @typedef {import('./job.js').JobFilters} JobFilters
 * @typedef {import('#lib/ats/job.js').Job} Job
 * @typedef {JobFilters & {seen: string}} SavedSearch
 */

/** @type {JobFilters} */
export const noFilters = { query: '', where: '', remote: '' };

/**
 * The filters kept in the page address. Where someone is (near) never is: a shared link must not tell it.
 * @typedef {'query' | 'where' | 'remote'} AddressFilter
 * @type {Record<AddressFilter, string>}
 */
const params = { query: 'q', where: 'where', remote: 'remote' };

/**
 * Filters from a page address: /jobs?q=frontend&where=berlin&remote=remote
 * @param {{get: (name: string) => string | null}} search the address's search params
 * @returns {JobFilters}
 */
export function fromParams(search) {
	const remote = search.get(params.remote) || '';
	return {
		query: search.get(params.query) || '',
		where: search.get(params.where) || '',
		remote: remote === 'remote' || remote === 'anywhere' ? remote : ''
	};
}

/**
 * The address query of some filters, without the empty ones ('' for none).
 * @param {JobFilters} filters
 */
export function toParams(filters) {
	const search = new URLSearchParams();
	for (const [field, name] of Object.entries(params)) {
		const value = filters[/** @type {AddressFilter} */ (field)].trim();
		if (value) search.set(name, value);
	}
	const text = search.toString();
	return text ? `?${text}` : '';
}

/** @param {JobFilters} filters */
export function isEmpty(filters) {
	return !toParams(filters);
}

/**
 * Two searches are the same when their filters are, whatever the case and spaces,
 * and from the same place (about 100 m), within the same time.
 * @param {JobFilters} a
 * @param {JobFilters} b
 */
export function sameSearch(a, b) {
	return searchId(a) === searchId(b);
}

/**
 * What tells a search apart from others.
 * @param {JobFilters} filters
 */
export function searchId(filters) {
	return JSON.stringify([toParams(normalize(filters)), nearby(filters.near), filters.near ? filters.within || 0 : 0]);
}

/**
 * Where someone searches from, to about 100 m: as precise as a commute needs, no more.
 * @param {[number, number] | null | undefined} near
 * @returns {[number, number] | null}
 */
export function nearby(near) {
	return near ? [Math.round(near[0] * 1e3) / 1e3, Math.round(near[1] * 1e3) / 1e3] : null;
}

/** @param {JobFilters} filters */
function normalize({ query, where, remote }) {
	/** @param {string} s */
	const tidy = (s) => s.trim().toLowerCase().replace(/\s+/g, ' ');
	return { query: tidy(query), where: tidy(where), remote };
}

/**
 * How many of a search's jobs were published since it was last looked at.
 * Jobs whose board gives no date are not counted.
 * @param {SavedSearch} search
 * @param {Job[]} jobs
 * @param {Map<string, string>} names company names by key
 */
export function newCount(search, jobs, names) {
	const since = time(search.seen);
	return sameOffers(filterJobs(jobs, search, names)).filter((j) => time(j.published) > since).length;
}
