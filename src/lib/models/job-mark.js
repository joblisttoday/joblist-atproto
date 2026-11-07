import { offerKey } from './job.js';

/**
 * What someone did with an offer: applied to it, or hid it from their results.
 * JobMark: how marks were kept before collections (job-collection.js), read once to move them.
 * @typedef {'applied' | 'hidden'} Mark
 * @typedef {{mark: Mark, at: string, title: string, company: string, url: string}} JobMark
 * @typedef {import('#lib/ats/job.js').Job} Job
 */

/**
 * Which offer a mark is for: a job board's offer at all its places (company and title),
 * an offer posted here by its address.
 * @param {Job} job
 */
export function markKey(job) {
	return job.posted ? job.url : offerKey(job);
}

/**
 * The jobs not hidden.
 * @param {Job[]} jobs
 * @param {Record<string, unknown>} hidden the Hidden collection's jobs, by markKey
 */
export function withoutHidden(jobs, hidden) {
	const keys = Object.keys(hidden);
	if (!keys.length) return jobs;
	const set = new Set(keys);
	return jobs.filter((job) => !set.has(markKey(job)));
}
