/**
 * The teams jobs are in, from the data itself: the department each job's board gives it
 * ("Engineering", "Starlink Network Engineering"), the same name in any case or spacing being
 * one team; no list of fields made up here. Jobs without one are in none.
 * The chips of Jobs and of an organization's page filter by them (#field=…, #team=…).
 * @typedef {import('#lib/ats/job.js').Job} Job
 */

/** A team's key: its name, lowercase, spaces made one ('' for none). @param {string | undefined} name */
export function teamKey(name) {
	return String(name || '')
		.trim()
		.replace(/\s+/g, ' ')
		.toLowerCase();
}

/** @param {Job} job */
export function teamOf(job) {
	return teamKey(job.department);
}

/**
 * The teams of some jobs, the largest first, each named as most of its jobs spell it, counted
 * as the list counts them.
 * @param {Job[]} jobs
 * @param {(jobs: Job[]) => number} count how many a team's jobs are (job.js offerCount: each offer once)
 * @returns {{id: string, label: string, count: number}[]}
 */
export function teamsOf(jobs, count = (list) => list.length) {
	/** @type {Map<string, {jobs: Job[], names: Map<string, number>}>} */
	const teams = new Map();
	/** @returns {{jobs: Job[], names: Map<string, number>}} */
	const empty = () => ({ jobs: [], names: new Map() });
	for (const job of jobs) {
		const id = teamOf(job);
		if (!id) continue;
		const team = teams.get(id) || empty();
		team.jobs.push(job);
		const name = String(job.department).trim().replace(/\s+/g, ' ');
		team.names.set(name, (team.names.get(name) || 0) + 1);
		teams.set(id, team);
	}
	return [...teams]
		.map(([id, { jobs: list, names }]) => ({ id, label: [...names].sort((a, b) => b[1] - a[1])[0][0], count: count(list) }))
		.sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}
