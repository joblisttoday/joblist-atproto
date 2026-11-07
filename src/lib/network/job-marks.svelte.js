import { markKey } from '#lib/models/job-mark.js';
import { collectionOf } from '#lib/models/job-collection.js';
import { kept, toggleJob } from './job-collections.svelte.js';

/**
 * Applied and Hidden, the built-in collections (job-collections.svelte.js), as
 * marks on one offer.
 * @typedef {import('#lib/models/job-mark.js').Mark} Mark
 * @typedef {import('#lib/ats/job.js').Job} Job
 */

/**
 * @param {Job} job
 * @returns {Mark | undefined}
 */
export function markOf(job) {
	const key = markKey(job);
	return /** @type {Mark[]} */ (['applied', 'hidden']).find((id) => collectionOf(kept.state, id)?.jobs[key]);
}

/**
 * Mark an offer, or unmark it when it already has this mark.
 * @param {Job} job
 * @param {Mark} mark
 * @param {string} company its name
 */
export function toggleMark(job, mark, company) {
	toggleJob(job, mark, company);
}
