import config from '#lib/data/config.json' with { type: 'json' };

/**
 * @typedef {import('#lib/ats/job.js').Job} Job
 * @typedef {{query: string, where: string, remote: boolean}} JobFilters
 */

const remoteWords = config.jobs.remoteWords;

/** @param {string} text */
const words = (text) => text.toLowerCase().split(/\s+/).filter(Boolean);

/**
 * Whether a job says it can be done remotely.
 * @param {Job} job
 */
export function isRemote(job) {
	if (job.remote) return job.remote === 'remote';
	const text = `${job.title} ${job.location || ''}`.toLowerCase();
	return remoteWords.some((w) => text.includes(w));
}

/**
 * Jobs matching the filters, newest first.
 * @param {Job[]} jobs
 * @param {JobFilters} filters
 * @param {Map<string, string>} names company names by key
 */
export function filterJobs(jobs, { query, where, remote }, names) {
	const what = words(query);
	const place = words(where);
	return jobs
		.filter((job) => {
			if (remote && !isRemote(job)) return false;
			if (place.length) {
				const location = (job.location || '').toLowerCase();
				if (!place.every((w) => location.includes(w))) return false;
			}
			if (!what.length) return true;
			const text = `${job.title} ${job.department || ''} ${names.get(job.company) || ''}`.toLowerCase();
			return what.every((w) => text.includes(w));
		})
		.sort((a, b) => time(b.published) - time(a.published));
}

/**
 * Jobs grouped by company, biggest group first.
 * @param {Job[]} jobs
 * @returns {[string, Job[]][]}
 */
export function byCompany(jobs) {
	/** @type {Map<string, Job[]>} */
	const groups = new Map();
	for (const job of jobs) {
		const group = groups.get(job.company) || [];
		group.push(job);
		groups.set(job.company, group);
	}
	return [...groups].sort((a, b) => b[1].length - a[1].length);
}

/**
 * The most frequent places in job locations, to suggest as filters.
 * @param {Job[]} jobs
 * @param {number} [limit]
 */
export function commonPlaces(jobs, limit = config.jobs.placesSuggested) {
	/** @type {Map<string, number>} */
	const counts = new Map();
	for (const job of jobs) {
		for (const part of (job.location || '').split(/[,;/|]/)) {
			const place = part.trim();
			if (place.length > 1) counts.set(place, (counts.get(place) || 0) + 1);
		}
	}
	return [...counts]
		.sort((a, b) => b[1] - a[1])
		.slice(0, limit)
		.map(([place]) => place);
}

/**
 * A sortable time, 0 when unknown.
 * @param {string | undefined} value
 */
export function time(value) {
	if (!value) return 0;
	const ms = Date.parse(String(value).replace(' UTC', 'Z').replace(' ', 'T'));
	return Number.isFinite(ms) ? ms : 0;
}
