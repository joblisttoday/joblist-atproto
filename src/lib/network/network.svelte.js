import config from '#lib/data/config.json';
import { getProfiles } from '#lib/atproto/identity.js';
import { listRecords, listRepos } from '#lib/atproto/records.js';
import { LOCAL, localLists } from './local-lists.svelte.js';
import { mapLimit } from '#lib/atproto/xrpc.js';
import { session } from '#lib/auth/session.svelte.js';
import { toCompany } from '#lib/models/company.js';
import { membership, toList } from '#lib/models/list.js';
import { toSuggestion } from '#lib/models/suggestion.js';
import { claimedCompanies, isLive, notFromCompany, toJob, toPost } from '#lib/models/job-post.js';
import { allowed } from '#lib/models/moderation.js';
import { isCompanyKey } from '#lib/models/landing.js';
import { Companies } from '#lib/models/companies.js';
import { readCache, writeCache } from './cache.js';
import { getSnapshotJobs, getSnapshotRecords } from './snapshot.js';

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
		if (!r.value?.name || !allowed(r) || !isCompanyKey(r.rkey)) continue;
		const versions = byKey.get(r.rkey) || [];
		versions.push(r);
		byKey.set(r.rkey, versions);
	}
	// The same company added twice is shown once (companies.js).
	return new Companies([...byKey.values()].map((versions) => toCompany(versions, profileMap)));
});

const lists = $derived(
	[...network.listRecords.filter((r) => allowed(r)), ...localLists.records]
		.filter((r) => r.value?.name)
		.map(toList)
		.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
);

const suggestions = $derived(
	network.suggestionRecords.filter((r) => r.value?.list && r.value?.company && allowed(r)).map(toSuggestion)
);

/** Every job offer posted on joblist, also expired ones (their posters can renew them). */
const posts = $derived(
	network.jobRecords
		.filter((r) => r.value?.title && r.value?.company && allowed(r))
		.map((r) => toPost(r, profileMap))
		.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
);

const livePosts = $derived(posts.filter((post) => isLive(post.record.value)));

/** Companies that speak for themselves: others' posts for them are not their jobs. */
const claimed = $derived(claimedCompanies(companies.values(), livePosts));

/** Posted jobs that can be shown now, by company key. */
const postedJobs = $derived.by(() => {
	/** @type {Map<string, import('#lib/ats/job.js').Job[]>} */
	const byCompany = new Map();
	for (const post of livePosts) {
		if (notFromCompany(post, claimed)) continue;
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
	get claimed() {
		return claimed;
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
 * Whether a list is the person's to change: kept on this device, or in their account.
 * @param {{did: string}} list
 */
export function ownsList(list) {
	return list.did === LOCAL || list.did === session.did;
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
 * Show what is known at once (local cache), then the snapshot when it is newer.
 * The snapshot is the network as everyone sees it, and only the signed-in person's
 * own records are read live (what they just wrote).
 */
export async function startNetwork() {
	if (started) return;
	started = true;
	// Only the pages showing jobs read them (they are large): the others count them from a small file.
	const cached = readCache();
	if (cached) Object.assign(network, cached);
	const snapshot = await getSnapshotRecords();
	if (snapshot && (!network.loadedAt || snapshot.loadedAt > network.loadedAt)) {
		network.companyRecords = snapshot.companyRecords;
		network.listRecords = snapshot.listRecords;
		network.suggestionRecords = snapshot.suggestionRecords || [];
		network.jobRecords = snapshot.jobRecords || [];
		network.profiles = snapshot.profiles;
		network.loadedAt = snapshot.loadedAt;
	}
	// An old snapshot is still the network (it says when it is from): every visitor reading
	// every account would be thousands of requests to other people's servers. Only without
	// any snapshot (a copy of the app with none) is every repository read.
	if (snapshot) {
		// Signed in (now or later): their own records, as they are now.
		$effect.root(() => {
			$effect(() => {
				if (session.did) refreshOwn(session.did);
			});
		});
		return;
	}
	// Reading the whole network is slow on a phone: once the jobs are shown, not while.
	getSnapshotJobs().finally(() => setTimeout(refresh, config.snapshot.refreshDelayMs));
}

/**
 * One account's records, read from its own server, in place of those known.
 * @param {string} did
 */
async function refreshOwn(did) {
	const types = /** @type {RecordType[]} */ (Object.keys(TYPES));
	const read = await Promise.all(types.map((type) => listRecords(did, config.collections[type]).catch(() => null)));
	types.forEach((type, i) => {
		const own = read[i];
		if (!own) return;
		const key = TYPES[type];
		const known = network[key].filter((r) => r.did === did);
		// Unchanged: left as it is, so nothing shown is worked out again.
		const versions = (/** @type {RepoRecord[]} */ list) => list.map((r) => `${r.uri} ${r.cid}`).sort().join('\n');
		if (versions(known) === versions(own)) return;
		network[key] = [...network[key].filter((r) => r.did !== did), ...own];
	});
	if (session.handle && !network.profiles[did]) network.profiles[did] = { did, handle: session.handle };
	writeCache(network);
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
