import { filterJobs, sameOffers, time } from './job.js';

/**
 * A job search someone keeps: its filters, and when they last looked at its jobs.
 * @typedef {import('./job.js').JobFilters} JobFilters
 * @typedef {import('#lib/ats/job.js').Job} Job
 * @typedef {JobFilters & {seen: string}} SavedSearch
 */

/**
 * The filters kept in the page address. Where someone is (near) never is: a shared link must not tell it.
 * @typedef {'query' | 'where' | 'remote'} AddressFilter
 * @type {Record<AddressFilter, string>}
 */
const params = { query: 'q', where: 'where', remote: 'remote' };
/** Only jobs showing their pay: ?pay=1 */
const payParam = 'pay';

/**
 * Filters from a page address: /jobs?q=frontend&where=berlin&remote=remote&pay=1
 * @param {{get: (name: string) => string | null}} search the address's search params
 * @returns {JobFilters}
 */
export function fromParams(search) {
	const remote = search.get(params.remote) || '';
	/** @type {JobFilters} */
	const filters = {
		query: search.get(params.query) || '',
		where: search.get(params.where) || '',
		remote: remote === 'remote' || remote === 'anywhere' ? remote : ''
	};
	if (search.get(payParam) === '1') filters.pay = true;
	return filters;
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
	if (filters.pay) search.set(payParam, '1');
	const text = search.toString();
	return text ? `?${text}` : '';
}

/** The address keys of a search, after the "#" (see navigation/address.js). */
export const searchKeys = [...Object.values(params), payParam, 'area'];

/**
 * A search as kept after the "#": its filters, and the part of the map searched
 * (west,south,east,north, to about 100 m). Where someone is (near) never is.
 * @param {JobFilters} filters
 * @returns {Record<string, string | boolean>}
 */
export function searchState(filters) {
	return {
		[params.query]: filters.query,
		[params.where]: filters.where,
		[params.remote]: filters.remote,
		[payParam]: Boolean(filters.pay),
		area: filters.area ? filters.area.flat().map((n) => n.toFixed(3)).join(',') : ''
	};
}

/**
 * The part of the map an address searches, checked: null when it is not one.
 * @param {string | null} text "13.088,52.338,13.761,52.675"
 * @returns {import('./job.js').Area | null}
 */
export function areaOf(text) {
	const n = (text || '').split(',').map(Number);
	if (n.length !== 4 || !n.every(Number.isFinite)) return null;
	const [west, south, east, north] = n;
	if (Math.abs(south) > 90 || Math.abs(north) > 90 || south >= north || Math.abs(west) > 180 || Math.abs(east) > 180) return null;
	return [
		[west, south],
		[east, north]
	];
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
function normalize({ query, where, remote, pay }) {
	/** @param {string} s */
	const tidy = (s) => s.trim().toLowerCase().replace(/\s+/g, ' ');
	return { query: tidy(query), where: tidy(where), remote, pay };
}

/**
 * How many of a search's jobs were published since it was last looked at.
 * Jobs whose board gives no date are not counted.
 * @param {SavedSearch} search
 * @param {Job[]} jobs
 * @param {Map<string, string>} names company names by key
 */
export function newCount(search, jobs, names) {
	return newJobs(search, jobs, names).length;
}

/**
 * A search's offers published since it was last looked at.
 * @param {SavedSearch} search
 * @param {Job[]} jobs
 * @param {Map<string, string>} names company names by key
 */
export function newJobs(search, jobs, names) {
	const since = time(search.seen);
	// The new jobs first (a handful), then the search on them: not a search of every job.
	return sameOffers(filterJobs(jobs.filter((j) => time(j.published) > since), search, names));
}

/**
 * The new offers of all searches, each once (searches can share some).
 * @param {SavedSearch[]} searches
 * @param {Job[]} jobs
 * @param {Map<string, string>} names company names by key
 */
export function allNewCount(searches, jobs, names) {
	return new Set(searches.flatMap((s) => newJobs(s, jobs, names).map((j) => j.url))).size;
}
