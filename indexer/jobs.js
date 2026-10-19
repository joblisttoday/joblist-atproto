import config from '../src/lib/data/config.json' with { type: 'json' };
import { getJobs } from '../src/lib/ats/index.js';
import { mapLimit } from '../src/lib/atproto/xrpc.js';
import { hasJobsApi } from '../src/lib/models/company.js';

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
 */
export function recordJobs(records, profiles) {
	const now = new Date().toISOString();
	return records
		.filter((r) => r.value?.title && r.value?.url && r.value?.company && String(r.value.expiresAt) > now)
		.map((r) => {
			const v = r.value;
			/** @type {IndexedJob} */
			const job = {
				t: v.title,
				u: v.url,
				c: v.company,
				l: (v.locations || []).map((/** @type {any} */ l) => l.name).filter(Boolean).join(', ') || v.remote || undefined,
				p: v.createdAt,
				s: r.uri
			};
			if (profiles.get(r.did)?.handle === v.company) job.v = 1;
			return job;
		});
}
