import config from '#lib/data/config.json' with { type: 'json' };
import { reconnect, session } from '#lib/auth/session.svelte.js';
import { keep, readKept } from '#lib/local/store.js';
import { nextToSend, notReached } from '#lib/models/outbox.js';

/**
 * The writes waiting to reach their account's server (models/outbox.js), kept in this
 * browser (IndexedDB) so they survive a reload. Sent in order, one sending at a time:
 * when the account is signed in again, when the browser is back online, and every
 * config.outbox.retryMs while its server can't be reached.
 * @typedef {import('#lib/models/outbox.js').OutboxEntry} OutboxEntry
 */

const KEY = 'outbox.v1';

export const outbox = $state({
	/** @type {OutboxEntry[]} */
	entries: [],
	sending: false,
	online: globalThis.navigator?.onLine !== false
});

/** @type {Promise<void> | undefined} */
let loading;
/** What waits, read from this browser (once). */
export function loadOutbox() {
	loading ??= readKept(KEY).then((kept) => {
		// Writes made while it loaded come after those kept.
		outbox.entries = [...(Array.isArray(kept) ? kept : []), ...outbox.entries];
	});
	return loading;
}
const save = () => keep(KEY, $state.snapshot(outbox.entries));

/** @type {(() => void)[]} */
const sentListeners = [];
/** Called after writes were sent or given up (the account's records can be read again). @param {() => void} listener */
export const onSent = (listener) => sentListeners.push(listener);

/**
 * Keep a write to send later.
 * @param {Omit<OutboxEntry, 'id' | 'at'>} entry
 */
export async function addToOutbox(entry) {
	await loadOutbox();
	outbox.entries.push({ ...entry, id: crypto.randomUUID(), at: new Date().toISOString() });
	await save();
	schedule();
}

/** Whether an account has writes waiting: a new one waits behind them, in order. @param {string} did */
export const hasWaiting = (did) => outbox.entries.some((e) => e.did === did && !e.error);

/** @type {ReturnType<typeof setTimeout> | undefined} */
let retry;
function schedule() {
	clearTimeout(retry);
	retry = setTimeout(sendOutbox, config.outbox.retryMs);
}

/** Send the signed-in account's waiting writes, in order, until one can't reach its server. */
export async function sendOutbox() {
	await loadOutbox();
	const { agent, did } = session;
	if (outbox.sending || !agent || !did) return;
	outbox.sending = true;
	let sent = false;
	try {
		for (let next = nextToSend(outbox.entries, did); next; next = nextToSend(outbox.entries, did)) {
			const { id, op, collection, rkey, record } = next;
			try {
				// (A cast inside this object loses its key in Svelte's compiler: typed beforehand.)
				const value = /** @type {Record<string, any>} */ (record);
				if (op === 'put') await agent.com.atproto.repo.putRecord({ repo: did, collection, rkey, record: value });
				else await agent.com.atproto.repo.deleteRecord({ repo: did, collection, rkey });
				outbox.entries = outbox.entries.filter((e) => e.id !== id);
				sent = true;
			} catch (err) {
				if (notReached(err)) break;
				// Refused (invalid, not allowed…): kept to give up, never sent again.
				const refused = outbox.entries.find((e) => e.id === id);
				if (refused) refused.error = err instanceof Error ? err.message : String(err);
			}
			await save();
		}
	} finally {
		outbox.sending = false;
	}
	if (hasWaiting(did)) schedule();
	if (sent) for (const listener of sentListeners) listener();
}

/** Forget a write that won't be sent: the account's records show as they are. @param {string} id */
export async function giveUp(id) {
	outbox.entries = outbox.entries.filter((e) => e.id !== id);
	await save();
	for (const listener of sentListeners) listener();
}

/** Load what waits, and send it whenever it can be: call once, in the browser. */
export function startOutbox() {
	loadOutbox();
	const update = () => {
		outbox.online = navigator.onLine;
		if (navigator.onLine) reconnect().then(sendOutbox);
	};
	addEventListener('online', update);
	addEventListener('offline', update);
	$effect.root(() => {
		// Signed in (again): what waited is sent.
		$effect(() => {
			if (session.agent) sendOutbox();
		});
	});
}
