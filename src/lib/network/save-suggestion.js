import config from '#lib/data/config.json';
import { createRecord, deleteRecord } from '#lib/atproto/write.js';
import { session } from '#lib/auth/session.svelte.js';
import { toRecord } from '#lib/models/suggestion.js';
import { removeLocal, upsertLocal } from './network.svelte.js';

/**
 * Suggest a company for someone else's list, from the signed-in person's account.
 * @param {{list: string, company: string, note?: string}} form
 */
export async function suggest(form) {
	const record = toRecord(form);
	const res = await createRecord(config.collections.suggestion, record);
	upsertLocal('suggestion', {
		did: /** @type {string} */ (session.did),
		rkey: res.uri.split('/').pop() || '',
		uri: res.uri,
		cid: res.cid,
		value: record
	});
}

/**
 * Take back one of the signed-in person's suggestions.
 * @param {import('#lib/models/suggestion.js').Suggestion} suggestion
 */
export async function withdraw(suggestion) {
	await deleteRecord(config.collections.suggestion, suggestion.rkey);
	removeLocal('suggestion', suggestion.uri);
}
