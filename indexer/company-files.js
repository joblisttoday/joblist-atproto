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
			const own = all.filter((j) => !j.s || j.v).sort((a, b) => String(b.p || '').localeCompare(String(a.p || '')));
			/** @type {[string, [number, number]][]} */
			const points = all.flatMap((j) => (j.s && j.g ? [[j.s, j.g]] : []));
			const file = {
				generatedAt,
				name: c.name,
				checked: read.has(c.key),
				gone: closed.has(c.key),
				jobs: own.map((j) => (j.s ? { ...j, u: postUrl(j.s) || j.u } : j)),
				points
			};
			return /** @type {[string, CompanyFile]} */ ([c.key, file]);
		});
}

/** A posted job's page here, from its record address (at://did/collection/rkey). @param {string} uri */
function postUrl(uri) {
	const [did, , rkey] = uri.replace('at://', '').split('/');
	return did && rkey ? config.url + postPath(did, rkey) : '';
}
