import config from '#lib/data/config.json';
import { getProfiles } from '#lib/atproto/identity.js';
import { listRecords, listRepos } from '#lib/atproto/records.js';
import { mapLimit } from '#lib/atproto/xrpc.js';
import { session } from '#lib/auth/session.svelte.js';
import { toCompany } from '#lib/models/company.js';
import { membership, toList } from '#lib/models/list.js';
import { toSuggestion } from '#lib/models/suggestion.js';
import { isLive, toJob, toPost } from '#lib/models/job-post.js';
import { readCache, writeCache } from './cache.js';
import { getSnapshotRecords } from './snapshot.js';

/**
 * @typedef {import('#lib/atproto/records.js').RepoRecord} RepoRecord
 * @typedef {import('#lib/atproto/identity.js').Profile} Profile
 */

/** The record types the app reads, and where each is kept. */
const TYPES = /** @type {const} */ ({
	company: 'companyRecords',
	list: 'listRecords',
	suggestion: 'suggestionRecords',
	job: 'jobRecords'
});
/** @typedef {keyof typeof TYPES} RecordType */

/** Everything the app knows about the network, loaded in the browser. */
export const network = $state({
	loading: false,
	/** @type {string | null} */
	loadedAt: null,
	/** @type {string | null} */
	error: null,
	/** @type {RepoRecord[]} */
	companyRecords: [],
	/** @type {RepoRecord[]} */
	listRecords: [],
	/** @type {RepoRecord[]} */
	suggestionRecords: [],
	/** @type {RepoRecord[]} */
	jobRecords: [],
	/** @type {Record<string, Profile>} */
	profiles: {},
	/** What a load has read so far. */
	progress: { accounts: 0, total: 0, records: 0 }
});

const profileMap = $derived(new Map(Object.entries(network.profiles)));

/** One company per key, with the version picked for the current viewer. */
const companies = $derived.by(() => {
	/** @type {Map<string, RepoRecord[]>} */
	const byKey = new Map();
	for (const r of network.companyRecords) {
		if (!r.value?.name) continue;
		const versions = byKey.get(r.rkey) || [];
		versions.push(r);
		byKey.set(r.rkey, versions);
	}
	return new Map(
		[...byKey].map(([key, versions]) => [key, toCompany(versions, profileMap)])
	);
});

const lists = $derived(
	network.listRecords
		.filter((r) => r.value?.name)
		.map(toList)
		.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
);

const suggestions = $derived(
	network.suggestionRecords.filter((r) => r.value?.list && r.value?.company).map(toSuggestion)
);

/** Every job offer posted on joblist, also expired ones (their posters can renew them). */
const posts = $derived(
	network.jobRecords
		.filter((r) => r.value?.title && r.value?.company)
		.map((r) => toPost(r, profileMap))
		.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
);

/** Posted jobs that can be shown now, by company key. */
const postedJobs = $derived.by(() => {
	/** @type {Map<string, import('#lib/ats/job.js').Job[]>} */
	const byCompany = new Map();
	for (const post of posts) {
		if (!isLive(post.record.value)) continue;
		byCompany.set(post.company, [...(byCompany.get(post.company) || []), toJob(post)]);
	}
	return byCompany;
});

export const data = {
	get companies() {
		return companies;
	},
	get lists() {
		return lists;
	},
	get suggestions() {
		return suggestions;
	},
	get posts() {
		return posts;
	},
	get postedJobs() {
		return postedJobs;
	},
	get profiles() {
		return profileMap;
	}
};

/** @param {string} did */
export function handleOf(did) {
	return network.profiles[did]?.handle || did;
}

/**
 * A list's companies, with what others suggested for it.
 * @param {import('#lib/models/list.js').List} list
 */
export function membersOf(list) {
	return membership(list, suggestions);
}

/**
 * Lists that include a company (also as an accepted suggestion of an open list).
 * @param {string} key
 */
export function listsWith(key) {
	return lists.filter((l) => membersOf(l).members.some((m) => m.key === key));
}

let started = false;

/**
 * Show what is known at once (local cache, else the AppView snapshot),
 * then refresh from the network, which stays the source of truth.
 */
export async function startNetwork() {
	if (started) return;
	started = true;
	const cached = readCache();
	if (cached) {
		Object.assign(network, cached);
	} else {
		const snapshot = await getSnapshotRecords();
		if (snapshot && !network.loadedAt) {
			network.companyRecords = snapshot.companyRecords;
			network.listRecords = snapshot.listRecords;
			network.suggestionRecords = snapshot.suggestionRecords || [];
			network.jobRecords = snapshot.jobRecords || [];
			network.profiles = snapshot.profiles;
			network.loadedAt = snapshot.loadedAt;
		}
	}
	refresh();
}

/** Read every record the app uses from every repository that has some. */
export async function refresh() {
	if (network.loading) return;
	network.loading = true;
	try {
		const types = /** @type {RecordType[]} */ (Object.keys(TYPES));
		const reposByType = await Promise.all(types.map((type) => listRepos(config.collections[type])));
		const dids = [...new Set(reposByType.flat())];
		network.progress = { accounts: 0, total: dids.length, records: 0 };
		/** @param {number} count */
		const onPage = (count) => (network.progress.records += count);
		const perRepo = await mapLimit(dids, config.limits.concurrency, async (did) => {
			const records = await Promise.all(
				types.map((type, i) =>
					reposByType[i].includes(did) ? listRecords(did, config.collections[type], onPage).catch(() => []) : []
				)
			);
			network.progress.accounts++;
			return records;
		});
		const profiles = await getProfiles(dids);
		types.forEach((type, i) => (network[TYPES[type]] = perRepo.flatMap((r) => r[i])));
		network.profiles = Object.fromEntries(profiles);
		network.loadedAt = new Date().toISOString();
		network.error = null;
		writeCache(network);
	} catch (err) {
		// keep what was loaded before; the network can be retried
		network.error = err instanceof Error ? err.message : String(err);
	} finally {
		network.loading = false;
	}
}

/**
 * Apply a local write at once, without waiting for a full refresh.
 * @param {RecordType} type
 * @param {RepoRecord} record
 */
export function upsertLocal(type, record) {
	const key = TYPES[type];
	network[key] = [...network[key].filter((r) => r.uri !== record.uri), record];
	if (session.did && session.handle && !network.profiles[session.did]) {
		network.profiles[session.did] = { did: session.did, handle: session.handle };
	}
	writeCache(network);
}

/**
 * @param {RecordType} type
 * @param {string} uri
 */
export function removeLocal(type, uri) {
	const key = TYPES[type];
	network[key] = network[key].filter((r) => r.uri !== uri);
	writeCache(network);
}
