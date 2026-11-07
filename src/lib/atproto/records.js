import config from '#lib/data/config.json' with { type: 'json' };
import { getPds } from './identity.js';
import { xrpcGet } from './xrpc.js';

/**
 * @typedef {{uri: string, cid: string, value: Record<string, any>}} AtRecord
 * @typedef {{did: string, rkey: string, uri: string, cid: string, value: Record<string, any>, seenAt?: string, newAuthor?: boolean}} RepoRecord
 *   seenAt, newAuthor: set by the snapshot on company versions (indexer/seen.js): when the
 *   indexer first saw this version, and whether a new account wrote it over someone else's.
 */

/**
 * Every repo holding a collection, as listed by the relay, or by the next one
 * (config.services.relayFallbacks) when it does not answer.
 * @param {string} collection
 * @param {string[]} [relays]
 */
export async function listRepos(collection, relays = [config.services.relay, ...config.services.relayFallbacks]) {
	let failure;
	for (const relay of relays) {
		try {
			return await listReposAt(relay, collection);
		} catch (err) {
			failure = err;
		}
	}
	throw failure;
}

/**
 * @param {string} relay
 * @param {string} collection
 */
async function listReposAt(relay, collection) {
	/** @type {string[]} */
	const dids = [];
	let cursor;
	do {
		const page = await xrpcGet(relay, 'com.atproto.sync.listReposByCollection', {
			collection,
			limit: 1000,
			cursor
		});
		dids.push(...(page.repos || []).map((/** @type {{did: string}} */ r) => r.did));
		cursor = page.cursor;
	} while (cursor);
	return dids;
}

/**
 * All records of a collection in one repo, read from its PDS.
 * @param {string} did
 * @param {string} collection
 * @param {(count: number) => void} [onPage] called with the number of records of each page read
 * @returns {Promise<RepoRecord[]>}
 */
export async function listRecords(did, collection, onPage) {
	const pds = await getPds(did);
	/** @type {RepoRecord[]} */
	const records = [];
	let cursor;
	let pages = 0;
	do {
		const page = await xrpcGet(pds, 'com.atproto.repo.listRecords', {
			repo: did,
			collection,
			limit: 100,
			cursor
		});
		for (const r of /** @type {AtRecord[]} */ (page.records || [])) {
			const rkey = recordKey(r.uri, did, collection);
			if (rkey) records.push({ did, rkey, uri: r.uri, cid: r.cid, value: r.value });
		}
		onPage?.(page.records?.length || 0);
		cursor = page.records?.length ? page.cursor : undefined;
		pages++;
	} while (cursor && pages < config.limits.pagesPerRepo);
	return records;
}

/**
 * One record, or null when it does not exist.
 * @param {string} did
 * @param {string} collection
 * @param {string} rkey
 * @returns {Promise<RepoRecord | null>}
 */
export async function getRecord(did, collection, rkey) {
	const pds = await getPds(did);
	try {
		const r = await xrpcGet(pds, 'com.atproto.repo.getRecord', { repo: did, collection, rkey });
		return { did, rkey, uri: r.uri, cid: r.cid, value: r.value };
	} catch {
		return null;
	}
}

/**
 * A record's key, when its address is the one asked for (this repository and
 * collection) and the key is a valid record key: what a server returns is not
 * trusted, since keys become page addresses and file names.
 * @param {string} uri
 * @param {string} did
 * @param {string} collection
 */
export function recordKey(uri, did, collection) {
	const prefix = `at://${did}/${collection}/`;
	if (typeof uri !== 'string' || !uri.startsWith(prefix)) return '';
	const rkey = uri.slice(prefix.length);
	return /^[A-Za-z0-9._:~-]{1,512}$/.test(rkey) && rkey !== '.' && rkey !== '..' ? rkey : '';
}
