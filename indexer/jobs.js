import config from '../src/lib/data/config.json' with { type: 'json' };
import { getJobs } from '../src/lib/ats/index.js';
import { mapLimit } from '../src/lib/atproto/xrpc.js';
import { hasJobsApi } from '../src/lib/models/company.js';
import { isLive, placeNames, toPost } from '../src/lib/models/job-post.js';

/**
 * @typedef {import('../src/lib/models/company.js').Company} Company
 * @typedef {import('../src/lib/atproto/records.js').RepoRecord} RepoRecord
 * @typedef {{t: string, u: string, c: string, l?: string, d?: string, p?: string, i?: string, r?: string, s?: string, v?: 1, g?: [number, number]}} IndexedJob
 *   Compact job (every phone downloads all of them): title, url, company key, location, department,
 *   published (to the minute), id at its board (left out when the url ends with it),
 *   where the work happens (onsite, hybrid, remote), source (a record uri; none for a job board),
 *   verified, where it is ([longitude, latitude]).
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
			jobs.push({
				t: j.title,
				u: j.url,
				c: company.key,
				l: j.location || undefined,
				d: j.department || undefined,
				p: toMinute(j.published),
				i: j.id && !j.url.endsWith(`/${j.id}`) ? j.id : undefined,
				r: j.remote || undefined
			});
		}
	});
	const { kept, duplicates, dropped } = tidyJobs(jobs);
	return { jobs: kept, health, duplicates, dropped };
}

const notJob = new RegExp(`\\b(${config.jobs.notJobs.join('|')})\\b`, 'i');

/**
 * Board jobs as people look for them:
 * - no "general application" or talent pool: they are not an open job;
 * - one row per link: a job a board lists once per city becomes one job in all its cities;
 *   a link two companies share (the same company added twice) stays with the one named by
 *   its domain, and the pair is reported to be merged.
 * @param {IndexedJob[]} jobs
 */
export function tidyJobs(jobs) {
	/** @type {Map<string, IndexedJob>} */
	const byUrl = new Map();
	/** @type {Set<string>} */
	const pairs = new Set();
	let dropped = 0;
	for (const job of jobs) {
		if (notJob.test(job.t)) {
			dropped++;
			continue;
		}
		const seen = byUrl.get(job.u);
		if (!seen) {
			byUrl.set(job.u, { ...job });
		} else if (seen.c === job.c) {
			const places = new Set([...(seen.l || '').split('; '), job.l || ''].filter(Boolean));
			seen.l = [...places].join('; ') || undefined;
		} else {
			const [keep, other] = [seen.c, job.c].sort((a, b) => Number(b.includes('.')) - Number(a.includes('.')) || a.localeCompare(b));
			pairs.add(JSON.stringify([keep, other]));
			if (keep !== seen.c) byUrl.set(job.u, { ...job, l: seen.l });
		}
	}
	return { kept: [...byUrl.values()], duplicates: [...pairs].map((p) => JSON.parse(p)), dropped };
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

/**
 * A date to the minute, in UTC ("2026-11-02T17:49Z"): enough to sort and say how new.
 * @param {string | undefined} value
 */
export function toMinute(value) {
	const ms = value ? Date.parse(value) : NaN;
	return Number.isFinite(ms) ? `${new Date(ms).toISOString().slice(0, 16)}Z` : value || undefined;
}
