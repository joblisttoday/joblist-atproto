import { offerKey } from './job.js';

/**
 * What someone did with an offer: applied to it, or hid it from their results.
 * Kept with its title and company, to list it once the offer closed.
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
 * @param {Record<string, JobMark>} marks
 */
export function withoutHidden(jobs, marks) {
	const hidden = new Set(Object.keys(marks).filter((key) => marks[key].mark === 'hidden'));
	return hidden.size ? jobs.filter((job) => !hidden.has(markKey(job))) : jobs;
}

/**
 * The marks of one kind, latest first.
 * @param {Record<string, JobMark>} marks
 * @param {Mark} mark
 * @returns {[string, JobMark][]}
 */
export function marked(marks, mark) {
	return Object.entries(marks)
		.filter(([, m]) => m.mark === mark)
		.sort(([, a], [, b]) => b.at.localeCompare(a.at));
}
