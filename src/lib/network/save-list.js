import config from '#lib/data/config.json';
import { putRecord } from '#lib/atproto/write.js';
import { toRecord } from '#lib/models/list.js';
import { upsertLocal } from './network.svelte.js';

/**
 * Save changes to one of the signed-in person's lists.
 * @param {import('#lib/models/list.js').List} list
 * @param {{companies?: string[], hidden?: string[]}} changes
 */
export async function updateList(list, changes) {
	const record = toRecord({ ...list, description: list.description || '', ...changes }, list.createdAt);
	const res = await putRecord(config.collections.list, list.rkey, record);
	upsertLocal('list', { did: list.did, rkey: list.rkey, uri: res.uri, cid: res.cid, value: record });
}
