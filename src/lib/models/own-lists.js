/**
 * Someone's lists, of both kinds, as one set of rows (/me/lists): their lists of jobs
 * (job-collection.js: private, in this browser, at /me/lists/{id}) and their lists of
 * organizations (list.js: private on this device, or public in their account).
 * @typedef {import('./job-collection.js').Collection} Collection
 * @typedef {import('./list.js').List} List
 * @typedef {{
 *   id: string,
 *   href: string,
 *   name: string,
 *   builtin: boolean,
 *   kind: 'jobs' | 'organizations',
 *   count: number,
 *   public: boolean,
 *   at: string
 * }} OwnList name: empty for the built-in lists of jobs (named by the interface); at: its latest change known
 */

/** Where a private list of jobs is. @param {string} id */
export const jobListPath = (id) => `/me/lists/${id}`;

/** @param {Collection} collection */
function latest(collection) {
	return Object.values(collection.jobs).reduce((at, job) => (job.at > at ? job.at : at), collection.at);
}

/**
 * @param {Collection[]} collections
 * @param {List[]} lists one's own lists of organizations
 * @param {(list: List) => string} pathOf a list's page
 * @param {(list: List) => boolean} isPublic
 * @returns {OwnList[]} the lists of jobs first (Saved, Applied, Hidden, then the named ones), then the lists of organizations
 */
export function ownLists(collections, lists, pathOf, isPublic) {
	return [
		...collections.map((c) => ({
			id: c.id,
			href: jobListPath(c.id),
			name: c.name,
			builtin: !c.name,
			kind: /** @type {const} */ ('jobs'),
			count: Object.keys(c.jobs).length,
			public: false,
			at: latest(c)
		})),
		...lists.map((l) => ({
			id: l.uri,
			href: pathOf(l),
			name: l.name,
			builtin: false,
			kind: /** @type {const} */ ('organizations'),
			count: l.companies.length,
			public: isPublic(l),
			at: l.createdAt || ''
		}))
	];
}

/**
 * The few to show at a glance: those with something in them, the latest changed first.
 * @param {OwnList[]} rows
 * @param {number} max
 */
export function recentLists(rows, max) {
	return rows
		.filter((r) => r.count)
		.sort((a, b) => b.at.localeCompare(a.at))
		.slice(0, max);
}
