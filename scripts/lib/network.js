/**
 * Read all company records of the network from node:
 * every repo the relay lists for the collection, then each repo's PDS.
 */
import config from '../../src/lib/data/config.json' with { type: 'json' };
import { xrpcGet, mapLimit } from '../../src/lib/atproto/xrpc.js';

/** @typedef {{did: string, rkey: string, uri: string, cid: string, value: Record<string, any>}} RepoRecord */

/** @param {string} collection */
async function listRepos(collection) {
	/** @type {string[]} */
	const dids = [];
	let cursor;
	do {
		const page = await xrpcGet(config.services.relay, 'com.atproto.sync.listReposByCollection', { collection, limit: 1000, cursor });
		dids.push(...(page.repos || []).map((/** @type {{did: string}} */ r) => r.did));
		cursor = page.cursor;
	} while (cursor);
	return dids;
}

/** @param {string} did */
async function getPds(did) {
	const url = did.startsWith('did:web:') ? `https://${did.slice(8)}/.well-known/did.json` : `${config.services.plc}/${did}`;
	const doc = await (await fetch(url)).json();
	const service = (doc.service || []).find((/** @type {{id: string}} */ s) => s.id === '#atproto_pds' || s.id === `${did}#atproto_pds`);
	if (!service) throw new Error(`no PDS for ${did}`);
	return service.serviceEndpoint;
}

/**
 * @param {string} did
 * @param {string} collection
 * @returns {Promise<RepoRecord[]>}
 */
async function listRecords(did, collection) {
	const pds = await getPds(did);
	/** @type {RepoRecord[]} */
	const records = [];
	let cursor;
	do {
		const page = await xrpcGet(pds, 'com.atproto.repo.listRecords', { repo: did, collection, limit: 100, cursor });
		for (const r of page.records || []) {
			records.push({ did, rkey: r.uri.split('/').pop(), uri: r.uri, cid: r.cid, value: r.value });
		}
		cursor = page.records?.length ? page.cursor : undefined;
	} while (cursor);
	return records;
}

/** All company records of the network, from every author. */
export async function loadCompanyRecords() {
	const collection = config.collections.company;
	const dids = await listRepos(collection);
	const perRepo = await mapLimit(dids, config.limits.concurrency, async (did) => {
		try {
			return await listRecords(did, collection);
		} catch (error) {
			console.warn(`skipping ${did}: ${error}`);
			return [];
		}
	});
	return { repos: dids.length, records: perRepo.flat() };
}
