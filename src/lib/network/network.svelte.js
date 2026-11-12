import config from '#lib/data/config.json';
import { getProfiles } from '#lib/atproto/identity.js';
import { listRecords } from '#lib/atproto/records.js';
import { resolveDid } from '#lib/atproto/identity.js';
import { mapLimit } from '#lib/atproto/xrpc.js';
import { session } from '#lib/auth/session.svelte.js';
import { isOwnRecord, speaksFor, toCompany } from '#lib/models/company.js';
import { claimedCompanies, isLive, notFromCompany, toJob, toPost } from '#lib/models/job-post.js';
import { allowed } from '#lib/models/moderation.js';
import { isCompanyKey } from '#lib/models/landing.js';
import { Companies } from '#lib/models/companies.js';
import { readCache, writeCache } from './cache.js';
import { loadOutbox, onSent, outbox } from './outbox.svelte.js';
import { overlay } from '#lib/models/outbox.js';

/**
 * @typedef {import('#lib/atproto/records.js').RepoRecord} RepoRecord
 * @typedef {import('#lib/atproto/identity.js').Profile} Profile
 */

/** The record types the app reads, and where each is kept. */
const TYPES = /** @type {const} */ ({
	company: 'companyRecords',
	job: 'jobRecords'
});
/** @typedef {keyof typeof TYPES} RecordType */

/**
 * What the app has read of the network, in the browser: no list of every organization,
 * only the signed-in person's own records, and the organizations looked up when their page
 * opens (lookup: the domain's own account, its organization record and its job offers).
 * status: "known" at once (nothing global to wait for).
 */
export const network = $state({
	/** @type {'reading' | 'known' | 'unreachable'} */
	status: 'known',
	loading: false,
	/** @type {string | null} */
	loadedAt: null,
	/** @type {string | null} */
	error: null,
	/** @type {RepoRecord[]} */
	companyRecords: [],
	/** @type {RepoRecord[]} */
	jobRecords: [],
	/** @type {Record<string, Profile>} */
	profiles: {},
	/** What a load has read so far. */
	progress: { accounts: 0, total: 0, records: 0 }
});

const profileMap = $derived(new Map(Object.entries(network.profiles)));

/** One company per key: only its own record (its author's handle is its domain). */
const companies = $derived.by(() => {
	/** @type {Map<string, RepoRecord[]>} */
	const byKey = new Map();
	for (const r of network.companyRecords) {
		if (!r.value?.name || !allowed(r) || !isCompanyKey(r.rkey) || !isOwnRecord(r, profileMap)) continue;
		const versions = byKey.get(r.rkey) || [];
		versions.push(r);
		byKey.set(r.rkey, versions);
	}
	// The same company added twice is shown once (companies.js).
	return new Companies([...byKey.values()].map((versions) => toCompany(versions, profileMap)));
});

/** Every job offer an organization posted itself, also expired ones (it can renew them). */
const posts = $derived(
	network.jobRecords
		.filter((r) => r.value?.title && r.value?.company && allowed(r) && speaksFor(profileMap, r.did, r.value.company))
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
	},
	/** What can be said about the data (network.status). */
	get status() {
		return network.status;
	}
};

/** @param {string} did */
export function handleOf(did) {
	return network.profiles[did]?.handle || did;
}

let started = false;

/**
 * What this browser kept (the records it read before, the outbox), then, signed in (now
 * or later), the person's own records as their server has them.
 */
export async function startNetwork() {
	if (started) return;
	started = true;
	const [cached] = await Promise.all([readCache(), loadOutbox()]);
	if (cached && !network.loadedAt) {
		network.companyRecords = cached.companyRecords || [];
		network.jobRecords = cached.jobRecords || [];
		network.profiles = cached.profiles || {};
		network.loadedAt = cached.loadedAt;
	}
	$effect.root(() => {
		$effect(() => {
			if (session.did) refreshOwn(session.did);
		});
	});
	// Sent or given up: their records as their server has them now.
	onSent(() => session.did && refreshOwn(session.did));
}

/** @type {Map<string, Promise<string | null>>} */
const looked = new Map();

/**
 * An organization by its domain, from its own account (its handle is its domain): its
 * organization record and its job offers, read from its server, once a session.
 * @param {string} domain
 * @returns {Promise<string | null>} its account's DID, or null when the domain is no account
 */
export function lookup(domain) {
	if (!looked.has(domain)) {
		looked.set(
			domain,
			resolveDid(domain)
				.then(async (did) => {
					const [profiles] = await Promise.all([getProfiles([did]), refreshOwn(did)]);
					const profile = profiles.get(did);
					if (profile) network.profiles[did] = profile;
					return did;
				})
				.catch(() => null)
		);
	}
	return /** @type {Promise<string | null>} */ (looked.get(domain));
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
	if (did === session.did && session.handle && !network.profiles[did]) network.profiles[did] = { did, handle: session.handle };
	showWaiting(did);
	keepNetwork();
}

/**
 * An account's writes waiting in the outbox, shown over what was read (the server or the
 * snapshot doesn't have them yet).
 * @param {string} did
 */
function showWaiting(did) {
	const waiting = outbox.entries.filter((e) => e.did === did);
	if (!waiting.length) return;
	for (const type of /** @type {RecordType[]} */ (Object.keys(TYPES))) {
		const key = TYPES[type];
		const own = network[key].filter((r) => r.did === did);
		network[key] = [...network[key].filter((r) => r.did !== did), ...overlay(own, waiting, config.collections[type])];
	}
}

/** Keep the network in this browser (IndexedDB, cache.js), as plain data. */
function keepNetwork() {
	writeCache($state.snapshot(network));
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
	keepNetwork();
}

/**
 * @param {RecordType} type
 * @param {string} uri
 */
export function removeLocal(type, uri) {
	const key = TYPES[type];
	network[key] = network[key].filter((r) => r.uri !== uri);
	keepNetwork();
}
