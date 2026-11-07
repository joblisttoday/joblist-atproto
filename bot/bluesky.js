/**
 * The few calls the bot makes to its own account's PDS, with fetch only (no npm
 * package runs where its password is). Far under the PDS limits: a dozen posts a day.
 */
import config from '../src/lib/data/config.json' with { type: 'json' };
import { getPds, resolveDid } from '../src/lib/atproto/identity.js';

const POST = 'app.bsky.feed.post';

/**
 * @typedef {{pds: string, did: string, token: string}} Session
 * @typedef {{uri: string, cid: string}} Ref
 */

/**
 * @param {string} url
 * @param {RequestInit} init
 */
async function call(url, init) {
	const res = await fetch(url, init);
	const body = await res.json().catch(() => ({}));
	// The error's name only: never what was sent.
	if (!res.ok) throw new Error(`${new URL(url).pathname}: ${res.status} ${body.error || ''}`);
	return body;
}

/**
 * Signed in with an app password, at the account's own PDS.
 * @param {string} handle
 * @param {string} password
 * @returns {Promise<Session>}
 */
export async function signIn(handle, password) {
	const did = await resolveDid(handle);
	const pds = await getPds(did);
	const session = await call(`${pds}/xrpc/com.atproto.server.createSession`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ identifier: did, password })
	});
	return { pds, did, token: session.accessJwt };
}

/**
 * When the account last started a digest (its first post carries config.bot.tag), from its newest posts.
 * @param {Session} session
 * @returns {Promise<number>} 0: none found
 */
export async function lastDigest({ pds, did }) {
	const params = new URLSearchParams({ repo: did, collection: POST, limit: '50' });
	const { records = [] } = await call(`${pds}/xrpc/com.atproto.repo.listRecords?${params}`, {});
	const times = records
		.filter((/** @type {any} */ r) => Array.isArray(r.value?.tags) && r.value.tags.includes(config.bot.tag))
		.map((/** @type {any} */ r) => Date.parse(r.value.createdAt) || 0);
	return Math.max(0, ...times);
}

/**
 * Posts a thread, each post a reply to the one before.
 * @param {Session} session
 * @param {import('./thread.js').Post[]} posts
 * @param {number} pauseMs between two posts
 * @returns {Promise<Ref[]>}
 */
export async function postThread({ pds, did, token }, posts, pauseMs) {
	/** @type {Ref[]} */
	const refs = [];
	for (const post of posts) {
		if (refs.length) await new Promise((done) => setTimeout(done, pauseMs));
		const reply = refs.length ? { root: refs[0], parent: /** @type {Ref} */ (refs.at(-1)) } : undefined;
		const record = { $type: POST, ...post, ...(reply && { reply }), langs: [config.defaultLocale], createdAt: new Date().toISOString() };
		const { uri, cid } = await call(`${pds}/xrpc/com.atproto.repo.createRecord`, {
			method: 'POST',
			headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
			body: JSON.stringify({ repo: did, collection: POST, record })
		});
		refs.push({ uri, cid });
	}
	return refs;
}
