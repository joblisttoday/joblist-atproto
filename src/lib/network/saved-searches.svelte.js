import { nearby, sameSearch } from '#lib/models/saved-search.js';

/**
 * Job searches kept in this browser only: what someone looks for says they
 * look for work, and a search near them says where they live, so neither
 * goes to their (public) atproto repository.
 * @typedef {import('#lib/models/saved-search.js').SavedSearch} SavedSearch
 * @typedef {import('#lib/models/job.js').JobFilters} JobFilters
 */

const KEY = 'joblist.searches.v1';

/** @returns {SavedSearch[]} */
function read() {
	try {
		const list = JSON.parse(localStorage.getItem(KEY) || '[]');
		return Array.isArray(list) ? list : [];
	} catch {
		return [];
	}
}

export const searches = $state({ list: read() });

function write() {
	try {
		localStorage.setItem(KEY, JSON.stringify(searches.list));
	} catch {
		// storage full or blocked: the searches last until the page closes
	}
}

/** @param {JobFilters} filters */
export function isSaved(filters) {
	return searches.list.some((s) => sameSearch(s, filters));
}

/** @param {JobFilters} filters */
export function saveSearch(filters) {
	if (isSaved(filters)) return;
	const { query, where, remote, near, within } = filters;
	const place = nearby(near);
	const kept = { query: query.trim(), where: where.trim(), remote, seen: new Date().toISOString() };
	searches.list = [...searches.list, place ? { ...kept, near: place, within: within || 0 } : kept];
	write();
}

/** @param {JobFilters} filters */
export function forgetSearch(filters) {
	searches.list = searches.list.filter((s) => !sameSearch(s, filters));
	write();
}

/**
 * Its jobs were just looked at: none of them is new any more.
 * @param {JobFilters} filters
 */
export function markSeen(filters) {
	if (!isSaved(filters)) return;
	const seen = new Date().toISOString();
	searches.list = searches.list.map((s) => (sameSearch(s, filters) ? { ...s, seen } : s));
	write();
}
