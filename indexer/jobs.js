import config from '../src/lib/data/config.json' with { type: 'json' };
import { getJobs } from '../src/lib/ats/index.js';
import { mapLimit } from '../src/lib/atproto/xrpc.js';
import { hasJobsApi } from '../src/lib/models/company.js';
import { isLive, placeNames, toPost } from '../src/lib/models/job-post.js';

/**
 * @typedef {import('../src/lib/models/company.js').Company} Company
 * @typedef {import('../src/lib/atproto/records.js').RepoRecord} RepoRecord
 * @typedef {{t: string, u: string, c: string, l?: string, d?: string, p?: string, s: string, v?: 1}} IndexedJob
 *   Compact job: title, url, company key, location, department, published, source ('ats' or a record uri), verified.
 */

/**
 * Open jobs of every company with a job board, plus how each board answered.
 * @param {Company[]} companies
 */
export async function fetchBoardJobs(companies) {
	/** @type {IndexedJob[]} */
	const jobs = [];
	/** @type {Record<string, {status: 'live' | 'empty' | 'none', jobs: number}>} */
	const health = {};
	await mapLimit(companies.filter(hasJobsApi), config.limits.indexerConcurrency, async (company) => {
		const found = await getJobs(company);
		health[company.key] = { status: found.length ? 'live' : 'empty', jobs: found.length };
		for (const j of found) {
			jobs.push({ t: j.title, u: j.url, c: company.key, l: j.location || undefined, d: j.department || undefined, p: j.published || undefined, s: 'ats' });
		}
	});
	return { jobs, health };
}

/**
 * Jobs posted as today.joblist.job records, without the expired ones.
 * @param {RepoRecord[]} records
 * @param {Map<string, {handle: string}>} profiles
 * @param {number} [now]
 */
export function recordJobs(records, profiles, now = Date.now()) {
	return records
		.filter((r) => isLive(r.value, now))
		.map((r) => {
			const post = toPost(r, profiles);
			/** @type {IndexedJob} */
			const job = {
				t: post.title,
				u: post.url,
				c: post.company,
				l: placeNames(post.locations) || post.remote || undefined,
				p: post.createdAt,
				s: post.uri
			};
			if (post.verified) job.v = 1;
			return job;
		});
}
