import config from '#lib/data/config.json';
import { resolveDid } from '#lib/atproto/identity.js';
import { getRecord } from '#lib/atproto/records.js';
import { toList } from '#lib/models/list.js';

/**
 * Read one list straight from its author's server, for lists the relay
 * has not indexed yet (or that were just created).
 * @param {string} handle
 * @param {string} rkey
 */
export async function loadList(handle, rkey) {
	const did = await resolveDid(handle);
	const record = await getRecord(did, config.collections.list, rkey);
	return record ? toList(record) : null;
}
