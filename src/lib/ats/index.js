import ashby from './ashby.js';
import greenhouse from './greenhouse.js';
import lever from './lever.js';
import personio from './personio.js';
import recruitee from './recruitee.js';
import rippling from './rippling.js';
import smartrecruiters from './smartrecruiters.js';
import workable from './workable.js';

/**
 * @typedef {(id: string) => Promise<Omit<import('./job.js').Job, 'company'>[]>} Fetcher
 */

/** @type {Record<string, Fetcher>} */
const fetchers = { ashby, greenhouse, lever, personio, recruitee, rippling, smartrecruiters, workable };

/** @type {Map<string, Promise<import('./job.js').Job[]>>} */
const cache = new Map();

/**
 * Open jobs of one company, read live from its job board.
 * Results are kept for the browser session.
 * @param {import('#lib/models/company.js').Company} company
 */
export function getJobs(company) {
	const { provider = '', id = '' } = company.jobBoard || {};
	const fetcher = fetchers[provider];
	if (!fetcher || !id) return Promise.resolve([]);
	const key = `${provider}:${id}`;
	if (!cache.has(key)) {
		cache.set(
			key,
			fetcher(id)
				.then((jobs) => jobs.filter((j) => j.title && j.url).map((j) => ({ ...j, company: company.key })))
				.catch(() => [])
		);
	}
	return /** @type {Promise<import('./job.js').Job[]>} */ (cache.get(key));
}
