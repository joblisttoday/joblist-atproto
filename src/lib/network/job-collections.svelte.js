import * as model from '#lib/models/job-collection.js';
import { cleanCollections, fromMarks, readCollectionsFile } from '#lib/models/job-collection-check.js';
import { markKey } from '#lib/models/job-mark.js';
import { localKey } from '#lib/local/space.js';
import { keepAll, kept as organizations } from './kept.svelte.js';

/**
 * The jobs someone keeps (Saved, Applied, Hidden and the collections they name), in this
 * browser only: job hunting is private, so none of it goes to their (public)
 * atproto repository. Moved between devices by exporting and importing a file, with the
 * saved organizations (kept.svelte.js).
 * @typedef {import('#lib/models/job-collection.js').Collections} Collections
 * @typedef {import('#lib/ats/job.js').Job} Job
 */

/** The current profile's (profiles.js). */
const KEY = localKey('joblist.collections.v1');
// Before collections: the applied and hidden marks, read once to start from them (and left in place).
const MARKS_KEY = localKey('joblist.marks.v1');

/** @returns {Collections} */
function read() {
	try {
		const stored = localStorage.getItem(KEY);
		if (stored) return cleanCollections(JSON.parse(stored)).value;
		return fromMarks(JSON.parse(localStorage.getItem(MARKS_KEY) || '{}'));
	} catch {
		return model.emptyCollections();
	}
}

/** @type {{state: Collections}} */
export const kept = $state({ state: read() });

/** @param {Collections} state */
function save(state) {
	kept.state = state;
	try {
		localStorage.setItem(KEY, JSON.stringify(state));
	} catch {
		// storage full or blocked: the collections last until the page closes
	}
}

/** The jobs hidden from results, by markKey. */
export function hiddenJobs() {
	return model.collectionOf(kept.state, 'hidden')?.jobs || {};
}

/** The collections a job is saved in: Saved and the named ones. @param {Job} job */
export function savedIn(job) {
	return model.savedIn(kept.state, markKey(job));
}

/** @param {Job} job */
export function namedWith(job) {
	return model.namedWith(kept.state, markKey(job));
}

/**
 * Put a job in a collection, or take it out.
 * @param {Job} job
 * @param {string} id
 * @param {string} company its name
 */
export function toggleJob(job, id, company) {
	save(model.toggleJob(kept.state, id, markKey(job), { title: job.title, company, url: job.url }));
}

/** @param {string} id @param {string} key */
export function removeJob(id, key) {
	save(model.removeJob(kept.state, id, key));
}

/** @param {string} name @returns {string} the new collection's id */
export function addCollection(name) {
	const { state, id } = model.addCollection(kept.state, name);
	save(state);
	return id;
}

/** @param {string} id @param {string} name */
export function renameCollection(id, name) {
	save(model.renameCollection(kept.state, id, name));
}

/** @param {string} id */
export function deleteCollection(id) {
	save(model.deleteCollection(kept.state, id));
}

/** The file of what is kept here, to download. */
export function exportFile() {
	return new Blob([model.exportCollections(kept.state, organizations.list)], { type: 'application/json' });
}

/**
 * Add what an exported file keeps to these: lists of jobs merged by id, organizations added.
 * @param {string} text
 * @throws {Error} when the file is not right (see readCollectionsFile)
 */
export function importFile(text) {
	const { collections, organizations: more } = readCollectionsFile(text);
	save(model.mergeCollections(kept.state, collections));
	keepAll(more);
}
