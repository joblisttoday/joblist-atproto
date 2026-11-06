import { safeUrl } from '#lib/models/url.js';
import config from '#lib/data/config.json';

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

/** @param {string | undefined} generatedAt */
function fresh(generatedAt) {
	const age = Date.now() - new Date(generatedAt || 0).getTime();
	return age < config.snapshot.maxAgeHours * 3600 * 1000;
}

/** Records as of the last snapshot, in the shape of the local cache. */
export function getSnapshotRecords() {
	return getFile('records.json');
}

/**
 * @typedef {{jobs: Map<string, import('#lib/ats/job.js').Job[]>, checked: Set<string>, gone: Set<string>, points: Map<string, [number, number]>}} SnapshotJobs
 *   gone: companies whose job board closed (found by the crawler).
 *   points: where the jobs posted on atproto are, by record address (the jobs themselves are read from their records).
 * @type {Promise<SnapshotJobs | null> | null}
 */
let jobsPromise = null;

/** Jobs as of the last snapshot, by company key; null when missing or stale. */
export function getSnapshotJobs() {
	jobsPromise ??= getFile('jobs.json').then((data) => {
		if (!data || !fresh(data.generatedAt)) return null;
		/** @type {Map<string, import('#lib/ats/job.js').Job[]>} */
		const jobs = new Map();
		/** @type {Map<string, [number, number]>} */
		const points = new Map();
		for (const j of data.jobs) {
			if (j.s?.startsWith('at://') && j.g) points.set(j.s, j.g);
			const job = toJob(j);
			if (!job) continue;
			const list = jobs.get(j.c) || [];
			list.push(job);
			jobs.set(j.c, list);
		}
		return { jobs, checked: new Set(data.checked || []), gone: new Set(data.gone || []), points };
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
			jobs: data.jobs.map(toJob).filter(Boolean),
			names: new Map(Object.entries(data.names || {}).map(([key, name]) => [key, String(name)]))
		};
	});
	return firstPromise;
}

/**
 * A job as the snapshot keeps it (see indexer/jobs.js), as the app uses it.
 * Posted jobs come from their records, read with the others (they may be edited or deleted since).
 * @param {any} j
 * @returns {import('#lib/ats/job.js').Job | null}
 */
function toJob(j) {
	if (j.s?.startsWith('at://')) return null;
	const url = safeUrl(j.u);
	if (!url) return null;
	// The id at its board is left out when the link ends with it.
	const id = j.i ?? url.slice(url.lastIndexOf('/') + 1);
	return { title: j.t, url, company: j.c, location: j.l, department: j.d, published: j.p, id, remote: j.r, point: j.g };
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
