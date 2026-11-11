import { safeUrl } from './url.js';
import { unpackSalary } from '../ats/salary.js';
import config from '#lib/data/config.json' with { type: 'json' };
import { newestFirst } from './job.js';

/**
 * A job as the snapshot keeps it (see indexer/jobs.js), as the app uses it.
 * Posted jobs come from their records, read with the others (they may be edited or deleted since).
 * Where the work happens was read by the indexer from the board, the location and the title:
 * none said is '' ("not said"), so the app does not read every job again (see workplace).
 * @param {any} j
 * @returns {import('#lib/ats/job.js').Job | null}
 */
export function fromSnapshot(j) {
	if (j.s?.startsWith('at://')) return null;
	const url = safeUrl(j.u);
	if (!url) return null;
	// The id at its board is left out when the link ends with it.
	const id = j.i ?? url.slice(url.lastIndexOf('/') + 1);
	return { title: j.t, url, company: j.c, location: j.l, department: j.d, published: j.p, id, remote: j.r || '', point: j.g, salary: unpackSalary(j.m) };
}

/**
 * @typedef {{generatedAt: string, all: import('#lib/ats/job.js').Job[], checked: string[], gone: string[], points: [string, [number, number]][]}} JobsFile
 *   all: its job board jobs, newest first (see newestFirst); points: where posted jobs are, by record address.
 */

/**
 * jobs.json as the app uses it (read in a worker: it is tens of thousands of jobs).
 * @param {any} data
 * @returns {JobsFile | null}
 */
export function readJobsFile(data) {
	if (!data || !Array.isArray(data.jobs)) return null;
	/** @type {import('#lib/ats/job.js').Job[]} */
	const all = [];
	/** @type {[string, [number, number]][]} */
	const points = [];
	for (const j of data.jobs) {
		if (j.s?.startsWith('at://') && j.g) points.push([j.s, j.g]);
		const job = fromSnapshot(j);
		if (job) all.push(job);
	}
	// Newest first, once: every list of jobs keeps this order (each company's is already, see indexer/counts.js).
	newestFirst(all);
	return { generatedAt: String(data.generatedAt || ''), all, checked: data.checked || [], gone: data.gone || [], points };
}

/**
 * One company's file (companies/{key}.json, see indexer/company-files.js) as the jobs of the
 * whole snapshot are used, with only that company: its page reads it instead of every job.
 * null for a file from before it said whether its board was read (then every job is read).
 * @param {string} key
 * @param {any} data
 * @returns {{generatedAt: string, all: import('#lib/ats/job.js').Job[], checked: string[], gone: string[], points: [string, [number, number]][]} | null}
 */
export function readCompanyFile(key, data) {
	if (!data || !Array.isArray(data.jobs) || typeof data.checked !== 'boolean') return null;
	/** @type {import('#lib/ats/job.js').Job[]} */
	const all = data.jobs.map(fromSnapshot).filter(Boolean);
	return {
		generatedAt: String(data.generatedAt || ''),
		all,
		checked: data.checked ? [key] : [],
		gone: data.gone ? [key] : [],
		points: Array.isArray(data.points) ? data.points : []
	};
}
