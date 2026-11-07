import { forget, keep, readKept } from './drafts.js';

/**
 * The job being written, kept in this browser until it is posted.
 * @typedef {import('#lib/models/job-post.js').JobForm} JobForm
 */

/**
 * The draft over the empty form, when there is one with something written.
 * @param {JobForm} empty
 * @returns {JobForm | null}
 */
export function readDraft(empty) {
	const form = readKept('job', empty);
	return form && (form.title || form.description) ? form : null;
}

/** @param {JobForm} form */
export const writeDraft = (form) => keep('job', form);

export const clearDraft = () => forget('job');
