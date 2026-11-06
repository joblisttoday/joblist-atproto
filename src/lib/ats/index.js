import { safeUrl } from '#lib/models/url.js';
import * as ashby from './ashby.js';
import * as greenhouse from './greenhouse.js';
import * as lever from './lever.js';
import * as personio from './personio.js';
import * as recruitee from './recruitee.js';
import * as rippling from './rippling.js';
import * as smartrecruiters from './smartrecruiters.js';
import * as workable from './workable.js';

/**
 * @typedef {(id: string) => Promise<Omit<import('./job.js').Job, 'company'>[]>} Fetcher
 *   The open jobs of a board.
 * @typedef {(id: string, jobId: string) => Promise<string>} Describer
 *   One job's description, as plain text ('' when the board does not say).
 * @typedef {{default: Fetcher, describe: Describer}} Provider
 */

/** @type {Record<string, Provider>} */
const providers = { ashby, greenhouse, lever, personio, recruitee, rippling, smartrecruiters, workable };

/** @type {Map<string, Promise<import('./job.js').Job[]>>} */
const cache = new Map();

/**
 * Open jobs of one company, read live from its job board.
 * Results are kept for the browser session.
 * @param {import('#lib/models/company.js').Company} company
 */
export function getJobs(company) {
	const { provider = '', id = '' } = company.jobBoard || {};
	const fetcher = providers[provider]?.default;
	if (!fetcher || !id) return Promise.resolve([]);
	const key = `${provider}:${id}`;
	if (!cache.has(key)) {
		cache.set(
			key,
			fetcher(id)
				.then((jobs) =>
					jobs
						.map((j) => ({ ...j, url: safeUrl(j.url) }))
						.filter((j) => j.title && j.url)
						.map((j) => ({ ...j, location: tidyPlace(j.location), company: company.key }))
				)
				.catch(() => [])
		);
	}
	return /** @type {Promise<import('./job.js').Job[]>} */ (cache.get(key));
}

/** @type {Map<string, Promise<string>>} */
const descriptions = new Map();

/**
 * One job's description, read live from its job board (kept for the browser session).
 * @param {import('#lib/models/company.js').Company | undefined} company
 * @param {import('./job.js').Job} job
 */
export function getDescription(company, job) {
	const { provider = '', id = '' } = company?.jobBoard || {};
	const describe = providers[provider]?.describe;
	if (!describe || !id || !job.id) return Promise.resolve('');
	const key = `${provider}:${id}:${job.id}`;
	if (!descriptions.has(key)) descriptions.set(key, describe(id, job.id).catch(() => ''));
	return /** @type {Promise<string>} */ (descriptions.get(key));
}

/**
 * 'Miskolc, , Hungary' → 'Miskolc, Hungary'
 * @param {string | undefined} place
 */
function tidyPlace(place) {
	return place?.split(',').map((part) => part.trim()).filter(Boolean).join(', ') || undefined;
}
