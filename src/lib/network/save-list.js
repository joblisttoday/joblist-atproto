import config from '#lib/data/config.json';
import { createRecord, deleteRecord, putRecord } from '#lib/atproto/write.js';
import { session } from '#lib/auth/session.svelte.js';
import { toRecord } from '#lib/models/list.js';
import { removeLocal, upsertLocal } from './network.svelte.js';
import { isLocal, newLocalKey, putLocalList, removeLocalList } from './local-lists.svelte.js';

/**
 * Save a list: on this device only (local), or in the signed-in person's account (published).
 * A list kept here and now published leaves this device.
 * @param {import('#lib/models/list-form.js').ListForm} form
 * @param {import('#lib/models/list.js').List | null} list
 * @param {boolean} [local] keep it on this device
 * @returns {Promise<string>} its record key
 */
export async function saveList(form, list, local = false) {
	const record = toRecord(form, list?.createdAt);
	if (local) {
		const rkey = list && isLocal(list) ? list.rkey : newLocalKey();
		putLocalList(rkey, record);
		return rkey;
	}
	if (list && isLocal(list)) {
		const rkey = await saveList(form, null);
		removeLocalList(list.rkey);
		return rkey;
	}
	const res = list
		? await putRecord(config.collections.list, list.rkey, record)
		: await createRecord(config.collections.list, record);
	const rkey = res.uri.split('/').pop() || '';
	upsertLocal('list', { did: /** @type {string} */ (session.did), rkey, uri: res.uri, cid: res.cid, value: record });
	return rkey;
}

/**
 * Save changes to one of the signed-in person's lists.
 * @param {import('#lib/models/list.js').List} list
 * @param {{companies?: string[], hidden?: string[]}} changes
 */
export async function updateList(list, changes) {
	const record = toRecord({ ...list, description: list.description || '', ...changes }, list.createdAt);
	if (isLocal(list)) return putLocalList(list.rkey, record);
	const res = await putRecord(config.collections.list, list.rkey, record);
	upsertLocal('list', { did: list.did, rkey: list.rkey, uri: res.uri, cid: res.cid, value: record });
}

/**
 * Delete one of the signed-in person's lists.
 * @param {import('#lib/models/list.js').List} list
 */
export async function deleteList(list) {
	if (isLocal(list)) return removeLocalList(list.rkey);
	await deleteRecord(config.collections.list, list.rkey);
	removeLocal('list', list.uri);
}
