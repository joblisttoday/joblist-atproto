import config from '../src/lib/data/config.json' with { type: 'json' };
import { time } from '../src/lib/models/job.js';
import { listPlace } from '../src/lib/models/list-place.js';
import { countJobs } from '../src/lib/models/snapshot-counts.js';
import { fromSnapshot } from '../src/lib/models/snapshot-job.js';

/**
 * Jobs by company, each company's newest first, in place: the app sorts them all from these
 * runs quickly, and a company's jobs side by side compress well (every phone downloads them).
 * @param {import('./jobs.js').IndexedJob[]} jobs
 */
export function newestByCompany(jobs) {
	const companies = new Map(jobs.map((job) => [job.c, 0]));
	let rank = 0;
	for (const company of companies.keys()) companies.set(company, rank++);
	const times = new Map(jobs.map((job) => [job, time(job.p)]));
	const at = (/** @type {import('./jobs.js').IndexedJob} */ job) => /** @type {number} */ (times.get(job));
	return jobs.sort((a, b) => /** @type {number} */ (companies.get(a.c)) - /** @type {number} */ (companies.get(b.c)) || at(b) - at(a));
}

/**
 * counts.json: what the companies, lists and search box count, without every job (see snapshot-counts.js).
 * @param {import('./jobs.js').IndexedJob[]} jobs
 * @param {{value?: {name?: unknown}}[]} listRecords
 * @param {string} generatedAt
 */
export function countsFile(jobs, listRecords, generatedAt) {
	const board = /** @type {import('../src/lib/ats/job.js').Job[]} */ (jobs.map(fromSnapshot).filter(Boolean));
	const placeSets = listRecords.flatMap((r) => {
		const place = listPlace({ name: String(r.value?.name || '') });
		return place ? [place.places] : [];
	});
	const limit = Math.max(config.quickSearch.places, config.jobs.placesSuggested);
	return { generatedAt, ...countJobs(board, placeSets, limit) };
}
