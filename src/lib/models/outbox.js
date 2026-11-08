/**
 * Writes kept in this browser until the person's own server can be reached (offline,
 * or unreachable): shown at once, sent in order later (network/outbox.svelte.js).
 * Pure: what a write is, whether an error means "not reached", and the records as they
 * will be once every waiting write is sent.
 *
 * @typedef {{id: string, did: string, op: 'put' | 'delete', collection: string, rkey: string, record?: Record<string, any>, at: string, error?: string}} OutboxEntry
 *   A create is kept as a put of its own record key: sent twice (an answer lost on the way), it
 *   writes the same record. error: the server refused it (kept to give up, never sent again).
 * @typedef {import('#lib/atproto/records.js').RepoRecord} RepoRecord
 */

/**
 * Whether an error means the server was not reached (then the write waits), not that it
 * refused the write (then it is said).
 * @param {unknown} err
 * @param {boolean} [online] navigator.onLine
 */
export function notReached(err, online = globalThis.navigator?.onLine !== false) {
	if (!online) return true;
	// fetch fails with a TypeError; the API client wraps it (XRPCError, its status 1: Unknown, the TypeError as its cause).
	for (let e = /** @type {any} */ (err), depth = 0; e && depth < 5; e = e.cause, depth++) {
		if (e instanceof TypeError || e?.name === 'TypeError') return true;
	}
	return false;
}

/**
 * The at:// address of a record.
 * @param {{did: string, collection: string, rkey: string}} entry
 */
export const uriOf = ({ did, collection, rkey }) => `at://${did}/${collection}/${rkey}`;

/**
 * An account's records of one collection as they will be once its waiting writes are sent:
 * written ones replaced or added (without a cid yet, `waiting: true`), deleted ones gone.
 * @param {RepoRecord[]} records
 * @param {OutboxEntry[]} entries in the order they were made
 * @param {string} collection
 * @returns {(RepoRecord & {waiting?: boolean})[]}
 */
export function overlay(records, entries, collection) {
	let out = /** @type {(RepoRecord & {waiting?: boolean})[]} */ (records);
	for (const entry of entries) {
		if (entry.collection !== collection || entry.error) continue;
		const uri = uriOf(entry);
		out = out.filter((r) => r.uri !== uri);
		if (entry.op === 'put' && entry.record) out = [...out, { did: entry.did, rkey: entry.rkey, uri, cid: '', value: entry.record, waiting: true }];
	}
	return out;
}

/**
 * The next write to send of an account: the oldest not refused, and not after a refused
 * write of the same record (sending it would undo the order the person wrote them in).
 * @param {OutboxEntry[]} entries
 * @param {string} did
 */
export function nextToSend(entries, did) {
	const stuck = new Set(entries.filter((e) => e.error).map(uriOf));
	return entries.find((e) => e.did === did && !e.error && !stuck.has(uriOf(e)));
}
