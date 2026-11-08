import { session } from '#lib/auth/session.svelte.js';
import { tid } from '#lib/atproto/tid.js';
import { uriOf, notReached } from '#lib/models/outbox.js';
import { addToOutbox, hasWaiting } from '#lib/network/outbox.svelte.js';

/**
 * Writes to the signed-in person's repository, local-first: one that can't reach their
 * server (offline, or it is down) is kept in the outbox and sent later, in order
 * (network/outbox.svelte.js), and the app shows it at once either way. A write the
 * server refuses is said at once, as before.
 */

/**
 * @param {import('#lib/models/outbox.js').OutboxEntry['op']} op
 * @param {string} collection
 * @param {string} rkey
 * @param {Record<string, any> | undefined} record
 * @returns {Promise<{uri: string, cid: string}>} cid '' while it waits
 */
async function write(op, collection, rkey, record) {
	const did = session.did;
	if (!did) throw new Error('not signed in');
	// Writes keep their order: while some wait, a new one waits behind them.
	if (session.agent && !hasWaiting(did)) {
		const repo = session.agent.com.atproto.repo;
		try {
			if (op === 'delete') {
				await repo.deleteRecord({ repo: did, collection, rkey });
				return { uri: uriOf({ did, collection, rkey }), cid: '' };
			}
			const res = await repo.putRecord({ repo: did, collection, rkey, record: /** @type {Record<string, any>} */ (record) });
			return { uri: res.data.uri, cid: res.data.cid };
		} catch (err) {
			if (!notReached(err)) throw err;
		}
	}
	await addToOutbox({ did, op, collection, rkey, ...(record && { record }) });
	return { uri: uriOf({ did, collection, rkey }), cid: '' };
}

/**
 * Create or replace a record in the signed-in user's repository.
 * @param {string} collection
 * @param {string} rkey
 * @param {Record<string, any>} record
 */
export const putRecord = (collection, rkey, record) => write('put', collection, rkey, record);

/**
 * Create a record. Its key is made here (a TID, unless one is given), so a record kept
 * offline already has its address, and sending it twice writes it once.
 * @param {string} collection
 * @param {Record<string, any>} record
 * @param {string} [rkey]
 */
export const createRecord = (collection, record, rkey = tid()) => write('put', collection, rkey, record);

/**
 * @param {string} collection
 * @param {string} rkey
 */
export async function deleteRecord(collection, rkey) {
	await write('delete', collection, rkey, undefined);
}
