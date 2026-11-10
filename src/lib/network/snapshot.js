import config from '#lib/data/config.json';
import { safeUrl } from '#lib/models/url.js';
import { fromSnapshot, listFilePath, readCompanyFile, readJobsFile, readListFile } from '#lib/models/snapshot-job.js';
import { readCounts } from '#lib/models/snapshot-counts.js';
import { newestFirst } from '#lib/models/job.js';

/**
 * The AppView snapshot: static files rebuilt on a schedule by indexer/.
 * Optional: when missing (local development) or too old, the app reads the network
 * directly, and only a few job boards (config.limits.liveBoards), never all of them.
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
	jobsPromise ??= getBytes('jobs.json')
		.then((bytes) => (bytes ? readInWorker(bytes) : null))
		.then((file) => {
			if (!file || !fresh(file.generatedAt)) return null;
			/** @type {Map<string, import('#lib/ats/job.js').Job[]>} */
			const jobs = new Map();
			for (const job of file.all) {
				const list = jobs.get(job.company);
				if (list) list.push(job);
				else jobs.set(job.company, [job]);
			}
			return { all: file.all, jobs, checked: new Set(file.checked), gone: new Set(file.gone), points: new Map(file.points) };
		});
	return jobsPromise;
}

/**
 * One company's small file (indexer/company-files.js); null when it has none.
 * @type {Map<string, Promise<ReturnType<typeof readCompanyFile>>>}
 */
const companyFiles = new Map();
/** @param {string} key */
function getCompanyFile(key) {
	let promise = companyFiles.get(key);
	if (!promise) {
		promise = getFile(`${config.embed.dir}/${encodeURIComponent(key)}.json`).then((data) => readCompanyFile(key, data));
		companyFiles.set(key, promise);
	}
	return promise;
}

/**
 * A few companies' jobs (a company's page, a small list), from their own small files, in the
 * shape of getSnapshotJobs: the page needs only them. Every job when one of them has no file
 * (a company added since the snapshot, an older snapshot), so none is ever shown with fewer.
 * @param {string[]} keys at most config.snapshot.companyFiles of them
 * @returns {Promise<SnapshotJobs | null>}
 */
export async function getCompaniesJobs(keys) {
	const files = await Promise.all(keys.map(getCompanyFile));
	if (files.some((file) => !file)) return getSnapshotJobs();
	// Too old: so is every job; their boards are read live instead.
	if (files.some((file) => !fresh(file?.generatedAt))) return null;
	const read = /** @type {NonNullable<(typeof files)[number]>[]} */ (files);
	const all = read.flatMap((file) => file.all);
	// Each file is newest first; together they are sorted again (a few hundred jobs at most).
	if (read.length > 1) newestFirst(all);
	return {
		all,
		jobs: new Map(keys.map((key, i) => [key, read[i].all])),
		checked: new Set(read.flatMap((file) => file.checked)),
		gone: new Set(read.flatMap((file) => file.gone)),
		points: new Map(read.flatMap((file) => file.points))
	};
}

/**
 * A list's jobs, from its own small file (indexer/list-files.js), in the shape of getSnapshotJobs.
 * Only when it holds the organizations the list has now: a list changed since the snapshot
 * reads them as any few companies do (getCompaniesJobs), or every job when they are many.
 * @param {{did: string, rkey: string}} list
 * @param {string[]} keys the list's organizations now
 * @returns {Promise<SnapshotJobs | null>}
 */
export async function getListJobs({ did, rkey }, keys) {
	const file = readListFile(await getFile(listFilePath({ did, rkey })));
	const same = file && file.companies.length === keys.length && keys.every((key) => file.companies.includes(key));
	if (file && same && fresh(file.generatedAt)) {
		/** @type {Map<string, import('#lib/ats/job.js').Job[]>} */
		const jobs = new Map(keys.map((key) => [key, []]));
		for (const job of file.all) jobs.get(job.company)?.push(job);
		return { all: file.all, jobs, checked: new Set(file.checked), gone: new Set(file.gone), points: new Map(file.points) };
	}
	return keys.length <= config.snapshot.companyFiles ? getCompaniesJobs(keys) : getSnapshotJobs();
}

/** @param {string} name */
async function getBytes(name) {
	try {
		const res = await fetch(`${config.snapshot.path}/${name}`);
		return res.ok ? await res.arrayBuffer() : null;
	} catch {
		return null;
	}
}

/**
 * jobs.json read by a worker (snapshot-jobs.worker.js), else here.
 * @param {ArrayBuffer} bytes
 * @returns {Promise<import('#lib/models/snapshot-job.js').JobsFile | null>}
 */
function readInWorker(bytes) {
	const here = () => {
		try {
			return readJobsFile(JSON.parse(new TextDecoder().decode(bytes)));
		} catch {
			return null;
		}
	};
	if (typeof Worker === 'undefined') return Promise.resolve(here());
	return new Promise((resolve) => {
		const worker = new Worker(new URL('./snapshot-jobs.worker.js', import.meta.url), { type: 'module' });
		worker.onmessage = (event) => {
			resolve(event.data);
			worker.terminate();
		};
		worker.onerror = () => {
			worker.terminate();
			resolve(here());
		};
		// Copied, not moved: read here if the worker cannot.
		worker.postMessage(bytes);
	});
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
	// Too old: no counts, rather than every job (they are as old).
	countsPromise ??= getFile('counts.json').then((data) => (data ? readCounts(fresh(data.generatedAt) ? data : { offers: {} }) : null));
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
