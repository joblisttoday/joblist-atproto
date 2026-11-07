import * as model from '#lib/models/job-collection.js';
import { cleanCollections, fromMarks, readCollectionsFile } from '#lib/models/job-collection-check.js';
import { markKey } from '#lib/models/job-mark.js';

/**
 * The jobs someone keeps (Applied, Hidden and the collections they name), in this
 * browser only: job hunting is private, so none of it goes to their (public)
 * atproto repository. Moved between devices by exporting and importing a file.
 * @typedef {import('#lib/models/job-collection.js').Collections} Collections
 * @typedef {import('#lib/ats/job.js').Job} Job
 */

const KEY = 'joblist.collections.v1';
// Before collections: the applied and hidden marks, read once to start from them (and left in place).
const MARKS_KEY = 'joblist.marks.v1';

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

/** The file of all collections, to download. */
export function exportFile() {
	return new Blob([model.exportCollections(kept.state)], { type: 'application/json' });
}

/**
 * Add the collections of an exported file to these.
 * @param {string} text
 * @throws {Error} when the file is not right (see readCollectionsFile)
 */
export function importFile(text) {
	save(model.mergeCollections(kept.state, readCollectionsFile(text)));
}
