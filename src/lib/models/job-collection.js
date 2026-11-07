import config from '#lib/data/config.json' with { type: 'json' };

/**
 * Collections of jobs someone keeps: the built-in Saved (one tap), Applied and Hidden,
 * and the ones they name ("Dream jobs"). Kept in the browser only: job hunting is private.
 * Collections kept before Saved existed get it, empty, when read (job-collection-check.js).
 * Jobs are keyed by markKey (job-mark.js) and kept with their title and company,
 * to list them once the offer closed.
 * @typedef {'saved' | 'applied' | 'hidden'} Builtin
 * @typedef {{title: string, company: string, url: string, at: string}} SavedJob at: when it was saved
 * @typedef {{id: string, name: string, at: string, jobs: Record<string, SavedJob>}} Collection
 *   name: empty for the built-in ones (named by the interface, in each language)
 * @typedef {{collections: Collection[]}} Collections
 */

const limits = config.jobCollections;
/** @type {Builtin[]} */
export const BUILTIN = ['saved', 'applied', 'hidden'];
/** A job is either applied to or hidden, never both. */
const EXCLUSIVE = ['applied', 'hidden'];
export const FORMAT = 'joblist.collections';

/** @param {string} id */
export const isBuiltin = (id) => /** @type {string[]} */ (BUILTIN).includes(id);

/** @param {string} id @returns {Collection} */
const builtin = (id) => ({ id, name: '', at: '', jobs: {} });

/** The built-in collections, empty. @returns {Collections} */
export function emptyCollections() {
	return { collections: BUILTIN.map(builtin) };
}

/** @param {Collections} state @param {string} id */
export function collectionOf(state, id) {
	return state.collections.find((c) => c.id === id);
}

/**
 * Replace one collection.
 * @param {Collections} state
 * @param {string} id
 * @param {(collection: Collection) => Collection} change
 * @returns {Collections}
 */
function update(state, id, change) {
	return { collections: state.collections.map((c) => (c.id === id ? change(c) : c)) };
}

/**
 * Put a job in a collection, or take it out when it is in it.
 * Applied and Hidden exclude each other.
 * @param {Collections} state
 * @param {string} id
 * @param {string} key
 * @param {Omit<SavedJob, 'at'>} job
 * @param {string} [now]
 */
export function toggleJob(state, id, key, job, now = new Date().toISOString()) {
	if (collectionOf(state, id)?.jobs[key]) return removeJob(state, id, key);
	const other = EXCLUSIVE.includes(id) ? EXCLUSIVE.find((b) => b !== id) : undefined;
	const cleared = other ? removeJob(state, other, key) : state;
	return update(cleared, id, (c) => ({ ...c, jobs: { ...c.jobs, [key]: { ...job, at: now } } }));
}

/** @param {Collections} state @param {string} id @param {string} key @returns {Collections} */
export function removeJob(state, id, key) {
	return update(state, id, (c) => {
		const { [key]: _, ...jobs } = c.jobs;
		return { ...c, jobs };
	});
}

/** A name as it is kept: trimmed, on one line, not too long. @param {string} name */
export function tidyName(name) {
	return name.replace(/\s+/g, ' ').trim().slice(0, limits.nameMax);
}

/**
 * A new named collection, last.
 * @param {Collections} state
 * @param {string} name
 * @param {string} [now]
 * @returns {{state: Collections, id: string}}
 */
export function addCollection(state, name, now = new Date().toISOString()) {
	// Random, not numbered: collections from two devices merge by id when imported.
	const ids = new Set(state.collections.map((c) => c.id));
	let id;
	do id = `c${Math.random().toString(36).slice(2, 12)}`;
	while (ids.has(id));
	return { state: { collections: [...state.collections, { id, name: tidyName(name), at: now, jobs: {} }] }, id };
}

/** @param {Collections} state @param {string} id @param {string} name @returns {Collections} */
export function renameCollection(state, id, name) {
	return isBuiltin(id) ? state : update(state, id, (c) => ({ ...c, name: tidyName(name) }));
}

/** @param {Collections} state @param {string} id @returns {Collections} */
export function deleteCollection(state, id) {
	return isBuiltin(id) ? state : { collections: state.collections.filter((c) => c.id !== id) };
}

/**
 * The named collections a job is in.
 * @param {Collections} state
 * @param {string} key
 */
export function namedWith(state, key) {
	return state.collections.filter((c) => !isBuiltin(c.id) && c.jobs[key]).map((c) => c.id);
}

/**
 * The collections a job is saved in: Saved, and the named ones.
 * @param {Collections} state
 * @param {string} key
 */
export function savedIn(state, key) {
	return state.collections.filter((c) => (c.id === 'saved' || !isBuiltin(c.id)) && c.jobs[key]).map((c) => c.id);
}

/**
 * A collection's jobs, latest saved first.
 * @param {Collection} collection
 * @returns {[string, SavedJob][]}
 */
export function savedJobs(collection) {
	return Object.entries(collection.jobs).sort(([, a], [, b]) => b.at.localeCompare(a.at));
}

/**
 * Two sets of collections in one: jobs of the same collection (by id) are joined,
 * the latest save of a job kept; the others are added after.
 * @param {Collections} state
 * @param {Collections} other
 * @returns {Collections}
 */
export function mergeCollections(state, other) {
	const merged = state.collections.map((c) => {
		const same = collectionOf(other, c.id);
		if (!same) return c;
		const jobs = { ...c.jobs };
		for (const [key, job] of Object.entries(same.jobs)) if (!jobs[key] || jobs[key].at < job.at) jobs[key] = job;
		return { ...c, jobs };
	});
	const known = new Set(state.collections.map((c) => c.id));
	return { collections: [...merged, ...other.collections.filter((c) => !known.has(c.id))].slice(0, limits.max) };
}

/** All collections as the file to download. @param {Collections} state */
export function exportCollections(state, now = new Date().toISOString()) {
	return JSON.stringify({ format: FORMAT, version: 1, exportedAt: now, collections: state.collections }, null, '\t');
}
