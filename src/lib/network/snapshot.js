import config from '#lib/data/config.json';
import { safeUrl } from '#lib/models/url.js';
import { newestFirst } from '#lib/models/job.js';
import { fromSnapshot } from '#lib/models/snapshot-job.js';
import { readCounts } from '#lib/models/snapshot-counts.js';

/**
 * The AppView snapshot: static files rebuilt on a schedule by indexer/.
 * Optional: when missing (local development) or stale, the app reads
 * the network and the job boards directly, as before.
 */

/** @param {string} name */
async function getFile(name) {
	try {
		const res = await fetch(`${config.snapshot.path}/${name}`);
		return res.ok ? await res.json() : null;
	} catch {
		return null;
	}
}

/**
 * Whether a snapshot is recent enough to show as the network.
 * @param {string | null | undefined} generatedAt
 */
export function fresh(generatedAt) {
	const age = Date.now() - new Date(generatedAt || 0).getTime();
	return age < config.snapshot.maxAgeHours * 3600 * 1000;
}

/** Records as of the last snapshot, in the shape of the local cache. */
export function getSnapshotRecords() {
	return getFile('records.json');
}

/**
 * @typedef {{all: import('#lib/ats/job.js').Job[], jobs: Map<string, import('#lib/ats/job.js').Job[]>, checked: Set<string>, gone: Set<string>, points: Map<string, [number, number]>}} SnapshotJobs
 *   all: every job, newest first; jobs: the same by company key, newest first.
 *   gone: companies whose job board closed (found by the crawler).
 *   points: where the jobs posted on atproto are, by record address (the jobs themselves are read from their records).
 * @type {Promise<SnapshotJobs | null> | null}
 */
let jobsPromise = null;

/** Jobs as of the last snapshot, by company key; null when missing or stale. */
export function getSnapshotJobs() {
	jobsPromise ??= getFile('jobs.json').then((data) => {
		if (!data || !fresh(data.generatedAt)) return null;
		/** @type {import('#lib/ats/job.js').Job[]} */
		const all = [];
		/** @type {Map<string, [number, number]>} */
		const points = new Map();
		for (const j of data.jobs) {
			if (j.s?.startsWith('at://') && j.g) points.set(j.s, j.g);
			const job = fromSnapshot(j);
			if (job) all.push(job);
		}
		// Newest first, once: every list of jobs keeps this order (each company's is already, see indexer/counts.js).
		newestFirst(all);
		/** @type {Map<string, import('#lib/ats/job.js').Job[]>} */
		const jobs = new Map();
		for (const job of all) {
			const list = jobs.get(job.company);
			if (list) list.push(job);
			else jobs.set(job.company, [job]);
		}
		return { all, jobs, checked: new Set(data.checked || []), gone: new Set(data.gone || []), points };
	});
	return jobsPromise;
}

/**
 * The newest offers and their companies' names, a small file read first:
 * the list shows them while the companies and all the jobs load.
 * @type {Promise<{jobs: import('#lib/ats/job.js').Job[], names: Map<string, string>}> | null}
 */
let firstPromise = null;
export function getSnapshotFirst() {
	firstPromise ??= getFile('first.json').then((data) => {
		if (!data || !fresh(data.generatedAt)) return { jobs: [], names: new Map() };
		return {
			jobs: data.jobs.map(fromSnapshot).filter(Boolean),
			names: new Map(Object.entries(data.names || {}).map(([key, name]) => [key, String(name)]))
		};
	});
	return firstPromise;
}

/**
 * What the pages that only count jobs need (see snapshot-counts.js), a small file;
 * null when missing or stale (they then count from all the jobs).
 * @type {Promise<import('#lib/models/snapshot-counts.js').Counts | null> | null}
 */
let countsPromise = null;
export function getSnapshotCounts() {
	countsPromise ??= getFile('counts.json').then((data) => (data && fresh(data.generatedAt) ? readCounts(data) : null));
	return countsPromise;
}

/**
 * Companies whose domain is their Bluesky handle (see indexer/bluesky.js), by key.
 * @typedef {{did: string, name?: string, avatar?: string, followers: number}} BlueskyAccount
 * @type {Promise<Map<string, BlueskyAccount>> | null}
 */
let accountsPromise = null;
export function getSnapshotAccounts() {
	accountsPromise ??= getFile(config.bluesky.file).then((data) => {
		/** @type {Map<string, BlueskyAccount>} */
		const accounts = new Map();
		for (const [key, a] of Object.entries(data || {})) {
			if (typeof a?.did !== 'string') continue;
			const avatar = safeUrl(a.avatar) || undefined;
			accounts.set(key, { did: a.did, name: a.name ? String(a.name) : undefined, avatar, followers: Number(a.followers) || 0 });
		}
		return accounts;
	});
	return accountsPromise;
}
