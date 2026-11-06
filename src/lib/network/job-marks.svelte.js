import { markKey } from '#lib/models/job-mark.js';

/**
 * The offers someone applied to or hid, kept in this browser only: where
 * someone applies is private, so it never goes to their (public) atproto repository.
 * @typedef {import('#lib/models/job-mark.js').JobMark} JobMark
 * @typedef {import('#lib/models/job-mark.js').Mark} Mark
 * @typedef {import('#lib/ats/job.js').Job} Job
 */

const KEY = 'joblist.marks.v1';

/** @returns {Record<string, JobMark>} */
function read() {
	try {
		const all = JSON.parse(localStorage.getItem(KEY) || '{}');
		return all && typeof all === 'object' && !Array.isArray(all) ? all : {};
	} catch {
		return {};
	}
}

/** all: by offer (see markKey). @type {{all: Record<string, JobMark>}} */
export const marks = $state({ all: read() });

function write() {
	try {
		localStorage.setItem(KEY, JSON.stringify(marks.all));
	} catch {
		// storage full or blocked: the marks last until the page closes
	}
}

/** @param {Job} job */
export function markOf(job) {
	return marks.all[markKey(job)]?.mark;
}

/**
 * Mark an offer, or unmark it when it already has this mark.
 * @param {Job} job
 * @param {Mark} mark
 * @param {string} company its name
 */
export function toggleMark(job, mark, company) {
	const key = markKey(job);
	const { [key]: old, ...rest } = marks.all;
	marks.all = old?.mark === mark ? rest : { ...rest, [key]: { mark, at: new Date().toISOString(), title: job.title, company, url: job.url } };
	write();
}

/** @param {string} key */
export function unmark(key) {
	const { [key]: _, ...rest } = marks.all;
	marks.all = rest;
	write();
}
