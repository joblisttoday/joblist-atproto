import config from '#lib/data/config.json';
import { getProfiles } from '#lib/atproto/identity.js';
import { listRecords, listRepos } from '#lib/atproto/records.js';
import { mapLimit } from '#lib/atproto/xrpc.js';
import { session } from '#lib/auth/session.svelte.js';
import { toCompany } from '#lib/models/company.js';
import { toList } from '#lib/models/list.js';
import { readCache, writeCache } from './cache.js';
import { getSnapshotRecords } from './snapshot.js';

/**
 * @typedef {import('#lib/atproto/records.js').RepoRecord} RepoRecord
 * @typedef {import('#lib/atproto/identity.js').Profile} Profile
 */

const { company: COMPANY, list: LIST } = config.collections;

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

export const data = {
	get companies() {
		return companies;
	},
	get lists() {
		return lists;
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
 * Lists that include a company.
 * @param {string} key
 */
export function listsWith(key) {
	return lists.filter((l) => l.companies.includes(key));
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
			network.profiles = snapshot.profiles;
			network.loadedAt = snapshot.loadedAt;
		}
	}
	refresh();
}

/** Read every company and list record from every repository that has some. */
export async function refresh() {
	if (network.loading) return;
	network.loading = true;
	try {
		const [companyDids, listDids] = await Promise.all([listRepos(COMPANY), listRepos(LIST)]);
		const dids = [...new Set([...companyDids, ...listDids])];
		network.progress = { accounts: 0, total: dids.length, records: 0 };
		/** @param {number} count */
		const onPage = (count) => (network.progress.records += count);
		const perRepo = await mapLimit(dids, config.limits.concurrency, async (did) => {
			const [c, l] = await Promise.all([
				companyDids.includes(did) ? listRecords(did, COMPANY, onPage).catch(() => []) : [],
				listDids.includes(did) ? listRecords(did, LIST, onPage).catch(() => []) : []
			]);
			network.progress.accounts++;
			return { c, l };
		});
		const profiles = await getProfiles(dids);
		network.companyRecords = perRepo.flatMap((r) => r.c);
		network.listRecords = perRepo.flatMap((r) => r.l);
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
 * @param {'company' | 'list'} type
 * @param {RepoRecord} record
 */
export function upsertLocal(type, record) {
	const key = type === 'company' ? 'companyRecords' : 'listRecords';
	network[key] = [...network[key].filter((r) => r.uri !== record.uri), record];
	if (session.did && session.handle && !network.profiles[session.did]) {
		network.profiles[session.did] = { did: session.did, handle: session.handle };
	}
	writeCache(network);
}

/**
 * @param {'company' | 'list'} type
 * @param {string} uri
 */
export function removeLocal(type, uri) {
	const key = type === 'company' ? 'companyRecords' : 'listRecords';
	network[key] = network[key].filter((r) => r.uri !== uri);
	writeCache(network);
}
