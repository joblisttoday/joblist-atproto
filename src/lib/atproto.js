import config from '#lib/data/config.json' with { type: 'json' };

/**
 * Reading atproto from the browser, with plain `fetch`: a handle's account, its server, its
 * Bluesky profile, its records. Only the safelisted `accept` header is sent, so browsers make
 * simple requests (no CORS preflight), which servers accept.
 * @typedef {{did: string, rkey: string, uri: string, cid: string, value: Record<string, any>}} RepoRecord
 */

/**
 * @param {string} service
 * @param {string} method
 * @param {Record<string, string | number | undefined>} [params]
 */
export async function xrpcGet(service, method, params = {}) {
	const url = new URL(`${service.replace(/\/$/, '')}/xrpc/${method}`);
	for (const [key, value] of Object.entries(params)) if (value !== undefined) url.searchParams.set(key, String(value));
	const res = await fetch(url, { headers: { accept: 'application/json' } });
	if (!res.ok) throw Object.assign(new Error(`${method} failed (${res.status})`), { status: res.status });
	return res.json();
}

/** Whether a request was answered "no" (400, 404), rather than not answered. @param {unknown} err */
export function refused(err) {
	const status = /** @type {{status?: number}} */ (err)?.status;
	return typeof status === 'number' && status >= 400 && status < 500;
}

/**
 * A handle's account (a DID passes through): asked to Bluesky's public resolver, else read
 * from the domain's own DNS (its _atproto record, over DNS-over-HTTPS).
 * @param {string} actor
 */
export async function resolveDid(actor) {
	if (actor.startsWith('did:')) return actor;
	try {
		const { did } = await xrpcGet(config.services.appview, 'com.atproto.identity.resolveHandle', { handle: actor });
		return /** @type {string} */ (did);
	} catch (err) {
		const url = `${config.services.dns}?${new URLSearchParams({ name: `_atproto.${actor}`, type: 'TXT' })}`;
		const answer = await fetch(url, { headers: { accept: 'application/dns-json' } }).then((r) => (r.ok ? r.json() : null), () => null);
		const txt = (answer?.Answer || []).map((/** @type {{data: string}} */ a) => String(a.data).replace(/"/g, '')).find((/** @type {string} */ d) => d.startsWith('did='));
		if (txt) return txt.slice('did='.length);
		throw err;
	}
}

/** @type {Map<string, Promise<any>>} */
const documents = new Map();

/** An account's identity document (its server, its handle). @param {string} did */
function didDocument(did) {
	if (!documents.has(did)) {
		const url = did.startsWith('did:web:') ? `https://${did.slice('did:web:'.length)}/.well-known/did.json` : `${config.services.plc}/${did}`;
		documents.set(
			did,
			fetch(url).then((res) => {
				if (!res.ok) throw new Error(`cannot resolve ${did}`);
				return res.json();
			})
		);
	}
	return /** @type {Promise<any>} */ (documents.get(did));
}

/** The server keeping an account's records. @param {string} did */
export async function getPds(did) {
	const doc = await didDocument(did);
	const service = (doc.service || []).find((/** @type {{id: string}} */ s) => s.id === '#atproto_pds' || s.id === `${did}#atproto_pds`);
	if (!service) throw new Error(`no server for ${did}`);
	return /** @type {string} */ (service.serviceEndpoint);
}

/**
 * An account's handle, as its identity document says and the handle confirms (both ways);
 * null when it does not.
 * @param {string} did
 */
export async function handleOf(did) {
	const doc = await didDocument(did).catch(() => null);
	const aka = (doc?.alsoKnownAs || []).find((/** @type {string} */ a) => a.startsWith('at://'));
	const handle = aka ? aka.slice('at://'.length).toLowerCase() : '';
	if (!handle) return null;
	return (await resolveDid(handle).catch(() => '')) === did ? handle : null;
}

/**
 * Its Bluesky profile: its handle as verified both ways ('handle.invalid' otherwise), name
 * and picture; null when it has none.
 * @param {string} did
 * @returns {Promise<{handle: string, displayName?: string, avatar?: string} | null>}
 */
export async function getProfile(did) {
	try {
		const p = await xrpcGet(config.services.appview, 'app.bsky.actor.getProfile', { actor: did });
		return { handle: p.handle, displayName: p.displayName, avatar: p.avatar };
	} catch {
		return null;
	}
}

/**
 * A record's key, when its address is in this repository and collection and the key is a
 * valid one: what a server returns is not trusted, since keys become page addresses.
 * @param {string} uri
 * @param {string} did
 * @param {string} collection
 */
export function recordKey(uri, did, collection) {
	const prefix = `at://${did}/${collection}/`;
	if (typeof uri !== 'string' || !uri.startsWith(prefix)) return '';
	const rkey = uri.slice(prefix.length);
	return /^[A-Za-z0-9._:~-]{1,512}$/.test(rkey) && rkey !== '.' && rkey !== '..' ? rkey : '';
}

/**
 * All records of a collection in one repository, read from its server.
 * @param {string} did
 * @param {string} collection
 * @returns {Promise<RepoRecord[]>}
 */
export async function listRecords(did, collection) {
	const pds = await getPds(did);
	/** @type {RepoRecord[]} */
	const records = [];
	let cursor;
	let pages = 0;
	do {
		const page = await xrpcGet(pds, 'com.atproto.repo.listRecords', { repo: did, collection, limit: 100, cursor });
		for (const r of page.records || []) {
			const rkey = recordKey(r.uri, did, collection);
			if (rkey) records.push({ did, rkey, uri: r.uri, cid: r.cid, value: r.value });
		}
		cursor = page.records?.length ? page.cursor : undefined;
		pages++;
	} while (cursor && pages < config.limits.pagesPerRepo);
	return records;
}

/**
 * One record, or null when it does not exist; it throws when its server does not answer.
 * @param {string} did
 * @param {string} collection
 * @param {string} rkey
 * @returns {Promise<RepoRecord | null>}
 */
export async function getRecord(did, collection, rkey) {
	const pds = await getPds(did);
	try {
		const r = await xrpcGet(pds, 'com.atproto.repo.getRecord', { repo: did, collection, rkey });
		return { did, rkey, uri: r.uri, cid: r.cid, value: r.value };
	} catch (err) {
		if (refused(err)) return null;
		throw err;
	}
}

const ALPHABET = '234567abcdefghijklmnopqrstuvwxyz';
let last = 0;
const clock = Math.floor(Math.random() * 1024);

/**
 * A record key in atproto's TID format (microseconds since 1970, then a random clock id),
 * made here so a new job offer knows its own page before it is written.
 * @param {number} [ms]
 */
export function tid(ms = Date.now()) {
	last = Math.max(last + 1, ms * 1000);
	let value = (BigInt(last) << 10n) | BigInt(clock);
	let out = '';
	for (let i = 0; i < 13; i++) {
		out = ALPHABET[Number(value & 31n)] + out;
		value >>= 5n;
	}
	return out;
}
