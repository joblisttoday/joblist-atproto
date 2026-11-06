/**
 * The job being written, kept in this browser until it is posted: a reload, or
 * signing in on the way (which leaves the page), does not lose it.
 * @typedef {import('#lib/models/job-post.js').JobForm} JobForm
 */

const KEY = 'joblist.jobDraft.v1';

/**
 * The draft over the empty form, when there is one with something written.
 * @param {JobForm} empty
 * @returns {JobForm | null}
 */
export function readDraft(empty) {
	try {
		const draft = JSON.parse(localStorage.getItem(KEY) || 'null');
		if (!draft || typeof draft !== 'object') return null;
		/** @type {Record<string, any>} */
		const form = { ...empty };
		for (const [field, value] of Object.entries(empty)) {
			if (typeof draft[field] === typeof value && Array.isArray(draft[field]) === Array.isArray(value)) form[field] = draft[field];
		}
		return form.title || form.description ? /** @type {JobForm} */ (form) : null;
	} catch {
		return null;
	}
}

/** @param {JobForm} form */
export function writeDraft(form) {
	try {
		localStorage.setItem(KEY, JSON.stringify(form));
	} catch {
		// storage full or blocked: the draft lasts until the page closes
	}
}

export function clearDraft() {
	try {
		localStorage.removeItem(KEY);
	} catch {
		// nothing kept
	}
}
