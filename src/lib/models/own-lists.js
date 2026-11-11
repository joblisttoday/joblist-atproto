/**
 * Someone's lists of jobs as rows (/me/lists): Saved, Applied, Hidden and the ones they
 * name (job-collection.js), private in this browser, each at /me/lists/{id}.
 * @typedef {import('./job-collection.js').Collection} Collection
 * @typedef {{id: string, href: string, name: string, builtin: boolean, count: number, at: string}} OwnList
 *   name: empty for the built-in lists (named by the interface); at: its latest change known
 */

/** Where a private list of jobs is. @param {string} id */
export const jobListPath = (id) => `/me/lists/${id}`;

/** @param {Collection} collection */
function latest(collection) {
	return Object.values(collection.jobs).reduce((at, job) => (job.at > at ? job.at : at), collection.at);
}

/**
 * @param {Collection[]} collections
 * @returns {OwnList[]} Saved, Applied, Hidden, then the named ones
 */
export function ownLists(collections) {
	return collections.map((c) => ({ id: c.id, href: jobListPath(c.id), name: c.name, builtin: !c.name, count: Object.keys(c.jobs).length, at: latest(c) }));
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
