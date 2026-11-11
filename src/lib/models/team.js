import { fieldsOf } from './landing.js';

/**
 * An organization's jobs by team: the department its board gives (consistent within one
 * organization), else the field read from the title, else none ('').
 * @typedef {import('#lib/ats/job.js').Job} Job
 * @param {Job[]} jobs
 * @param {(field: string) => string} fieldName a field's name, in the language read
 * @returns {[string, Job[]][]} [team, jobs], the largest first, those with no team last
 */
export function byTeam(jobs, fieldName) {
	/** @type {Map<string, Job[]>} */
	const groups = new Map();
	for (const job of jobs) {
		const field = job.department?.trim() ? '' : fieldsOf({ t: job.title, d: '' })[0];
		const team = job.department?.trim() || (field ? fieldName(field) : '');
		const group = groups.get(team) || [];
		group.push(job);
		groups.set(team, group);
	}
	return [...groups].sort((a, b) => Number(!a[0]) - Number(!b[0]) || b[1].length - a[1].length);
}
