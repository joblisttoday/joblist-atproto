import { fieldsOf } from './landing.js';

/**
 * An organization's teams: the department its board gives a job (consistent within one
 * organization), else the field its title says ("field:engineering"), else none ('').
 * The chips of an organization's page filter its jobs by them (#team=…).
 * @typedef {import('#lib/ats/job.js').Job} Job
 */

/** @param {Job} job */
export function teamOf(job) {
	const department = job.department?.trim();
	if (department) return department;
	const field = fieldsOf({ t: job.title, d: '' })[0];
	return field ? `field:${field}` : '';
}

/**
 * The teams of some jobs, the largest first (none left out), counted as the list counts them.
 * @param {Job[]} jobs
 * @param {(jobs: Job[]) => number} count how many a team's jobs are (job.js offerCount: each offer once)
 * @returns {{id: string, count: number}[]}
 */
export function teamsOf(jobs, count = (list) => list.length) {
	/** @type {Map<string, Job[]>} */
	const teams = new Map();
	for (const job of jobs) {
		const team = teamOf(job);
		if (!team) continue;
		const list = teams.get(team);
		if (list) list.push(job);
		else teams.set(team, [job]);
	}
	return [...teams].map(([id, list]) => ({ id, count: count(list) })).sort((a, b) => b.count - a.count);
}
