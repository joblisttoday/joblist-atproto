import config from '#lib/data/config.json';
import { getPds } from './identity.js';
import { xrpcGet } from './xrpc.js';

/**
 * @typedef {{uri: string, cid: string, value: Record<string, any>}} AtRecord
 * @typedef {{did: string, rkey: string, uri: string, cid: string, value: Record<string, any>}} RepoRecord
 */

/**
 * Every repo holding a collection, as listed by the relay.
 * @param {string} collection
 */
export async function listRepos(collection) {
	/** @type {string[]} */
	const dids = [];
	let cursor;
	do {
		const page = await xrpcGet(config.services.relay, 'com.atproto.sync.listReposByCollection', {
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
 * @returns {Promise<RepoRecord[]>}
 */
export async function listRecords(did, collection) {
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
			records.push({ did, rkey: r.uri.split('/').pop() || '', uri: r.uri, cid: r.cid, value: r.value });
		}
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
