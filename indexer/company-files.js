import config from '../src/lib/data/config.json' with { type: 'json' };
import { isCompanyKey } from '../src/lib/models/landing.js';
import { postPath } from '../src/lib/models/job-post.js';

/**
 * One small file per company (companies/{key}.json): its open jobs, newest first, for
 * its page here (instead of every job) and for the embeds on other sites.
 * Embeds speak in the company's name: only its job board's jobs and those it posted
 * itself (verified), the posted ones linking to their page here; where the others it was
 * posted for are is in `points`, for its page's map. Static files under a key: any copy
 * of the snapshot serves them, and there is one more per company, never a bigger one.
 *
 * @typedef {import('./jobs.js').IndexedJob} IndexedJob
 * @typedef {{generatedAt: string, name: string, checked: boolean, gone: boolean, jobs: IndexedJob[], points: [string, [number, number]][]}} CompanyFile
 *   checked: its board was read (an empty list is real); gone: its board closed (the last crawl).
 */

/**
 * @param {{key: string, name: string}[]} companies
 * @param {IndexedJob[]} jobs
 * @param {{generatedAt: string, checked: Iterable<string>, gone: Iterable<string>}} snapshot
 * @returns {[string, CompanyFile][]}
 */
export function companyFiles(companies, jobs, { generatedAt, checked, gone }) {
	const read = new Set(checked);
	const closed = new Set(gone);
	/** @type {Map<string, IndexedJob[]>} */
	const byCompany = new Map();
	for (const job of jobs) {
		const list = byCompany.get(job.c);
		if (list) list.push(job);
		else byCompany.set(job.c, [job]);
	}
	return companies
		.filter((c) => isCompanyKey(c.key))
		.map((c) => {
			const all = byCompany.get(c.key) || [];
			const file = {
				generatedAt,
				name: c.name,
				checked: read.has(c.key),
				gone: closed.has(c.key),
				jobs: publicJobs(all),
				points: postPoints(all)
			};
			return /** @type {[string, CompanyFile]} */ ([c.key, file]);
		});
}

/**
 * The jobs an organization's or a list's file shows, newest first: its job boards' jobs and
 * the offers organizations posted themselves (verified), these linking to their page here.
 * @param {IndexedJob[]} jobs
 */
export function publicJobs(jobs) {
	return jobs
		.filter((j) => !j.s || j.v)
		.sort((a, b) => String(b.p || '').localeCompare(String(a.p || '')))
		.map((j) => (j.s ? { ...j, u: postUrl(j.s) || j.u } : j));
}

/**
 * Where the offers posted on joblist are, by record address, for the page's map.
 * @param {IndexedJob[]} jobs
 * @returns {[string, [number, number]][]}
 */
export function postPoints(jobs) {
	return jobs.flatMap((j) => (j.s && j.g ? [/** @type {[string, [number, number]]} */ ([j.s, j.g])] : []));
}

/** A posted job's page here, from its record address (at://did/collection/rkey). @param {string} uri */
function postUrl(uri) {
	const [did, , rkey] = uri.replace('at://', '').split('/');
	return did && rkey ? config.url + postPath(did, rkey) : '';
}
