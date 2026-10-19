/**
 * Check a job board with the app's own fetchers (src/lib/ats),
 * telling a live board apart from an empty or a closed one.
 */
import ashby from '../../src/lib/ats/ashby.js';
import greenhouse from '../../src/lib/ats/greenhouse.js';
import lever from '../../src/lib/ats/lever.js';
import recruitee from '../../src/lib/ats/recruitee.js';
import rippling from '../../src/lib/ats/rippling.js';
import smartrecruiters from '../../src/lib/ats/smartrecruiters.js';
import workable from '../../src/lib/ats/workable.js';
import personio from './personio.js';
import { politeFetch, withHits, reason } from './http.js';

/** @type {Record<string, (id: string) => Promise<{title: string, url: string}[]>>} */
const fetchers = { ashby, greenhouse, lever, personio, recruitee, rippling, smartrecruiters, workable };

/**
 * @typedef {{
 *   provider: string, id: string,
 *   state: 'live' | 'empty' | 'dead' | 'error' | 'unsupported',
 *   status?: number, error?: string, jobs?: number
 * }} BoardCheck
 */

/**
 * SmartRecruiters answers any id with an empty list; its careers page
 * redirects to the home page when the company does not exist.
 * @param {string} id
 */
async function smartrecruitersExists(id) {
	try {
		const res = await politeFetch(`https://careers.smartrecruiters.com/${encodeURIComponent(id)}`, { redirect: 'manual' });
		await res.body?.cancel();
		return res.status === 200;
	} catch {
		return true;
	}
}

/**
 * @param {{provider?: string, id?: string}} jobBoard
 * @returns {Promise<BoardCheck>}
 */
export async function checkBoard({ provider = '', id = '' }) {
	const fetcher = fetchers[provider];
	if (!fetcher || !id) return { provider, id, state: 'unsupported' };
	let jobs;
	let thrown;
	const { hits } = await withHits(async () => {
		try {
			jobs = (await fetcher(id)).filter((j) => j.title && j.url);
		} catch (error) {
			thrown = reason(error);
		}
	});
	const first = hits[0];
	if (!first) return { provider, id, state: 'error', error: thrown || 'no request' };
	if (first.error === 'ENOTFOUND') return { provider, id, state: 'dead', error: first.error };
	if (first.error) return { provider, id, state: 'error', error: first.error };
	if (first.status && [404, 410].includes(first.status)) return { provider, id, state: 'dead', status: first.status };
	if (first.status && first.status >= 300) return { provider, id, state: 'error', status: first.status };
	if (thrown || !jobs) return { provider, id, state: 'error', status: first.status, error: thrown };
	const count = /** @type {any[]} */ (jobs).length;
	if (!count && provider === 'smartrecruiters' && !(await smartrecruitersExists(id))) {
		return { provider, id, state: 'dead', status: first.status };
	}
	return { provider, id, state: count ? 'live' : 'empty', status: first.status, jobs: count };
}
