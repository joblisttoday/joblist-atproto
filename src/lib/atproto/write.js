import { session } from '#lib/auth/session.svelte.js';

function agent() {
	if (!session.agent || !session.did) throw new Error('not signed in');
	return { agent: session.agent, repo: session.did };
}

/**
 * Create or replace a record in the signed-in user's repository.
 * @param {string} collection
 * @param {string} rkey
 * @param {Record<string, any>} record
 */
export async function putRecord(collection, rkey, record) {
	const { agent: a, repo } = agent();
	const res = await a.com.atproto.repo.putRecord({ repo, collection, rkey, record });
	return res.data;
}

/**
 * Create a record, with a generated key unless one is given.
 * @param {string} collection
 * @param {Record<string, any>} record
 * @param {string} [rkey]
 */
export async function createRecord(collection, record, rkey) {
	const { agent: a, repo } = agent();
	const res = await a.com.atproto.repo.createRecord({ repo, collection, record, rkey });
	return res.data;
}

/**
 * @param {string} collection
 * @param {string} rkey
 */
export async function deleteRecord(collection, rkey) {
	const { agent: a, repo } = agent();
	await a.com.atproto.repo.deleteRecord({ repo, collection, rkey });
}
