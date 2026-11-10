/**
 * The Bluesky (atproto) accounts signed in on this browser, and the one in use: someone
 * can publish as themselves and as their organization, switching between them. What they
 * keep privately is one space whichever account is in use (local/space.js).
 *
 * @typedef {{did: string, handle?: string}} Account
 * @typedef {{current: string | null, list: Account[]}} Accounts
 */

const KEY = 'joblist.accounts.v1';
/** Before: profiles, each with at most one account. */
const PROFILES = 'joblist.profiles.v1';
/** Before profiles: the account signed in. */
const OLD_SESSION = 'joblist.session.v1';

/** @returns {Storage | null} */
function storage() {
	try {
		return localStorage;
	} catch {
		return null;
	}
}

/** @param {Storage | null} store @param {string} key */
function parse(store, key) {
	try {
		return JSON.parse(store?.getItem(key) || 'null');
	} catch {
		return null;
	}
}

/** @param {any} value @returns {value is string} */
const isDid = (value) => typeof value === 'string' && value.startsWith('did:') && value.length <= 2048;

/**
 * The accounts, checked: from older profiles (or an older sign-in) the first time.
 * @param {Storage | null} [store]
 * @returns {Accounts}
 */
export function readAccounts(store = storage()) {
	const saved = parse(store, KEY);
	if (saved) {
		const list = (Array.isArray(saved.list) ? saved.list : [])
			.filter((/** @type {any} */ a) => isDid(a?.did))
			.map((/** @type {any} */ a) => ({ did: a.did, ...(typeof a.handle === 'string' ? { handle: a.handle.slice(0, 253) } : {}) }));
		return { current: list.some((/** @type {Account} */ a) => a.did === saved.current) ? saved.current : null, list };
	}
	const profiles = parse(store, PROFILES);
	/** @type {Account[]} */
	const list = [];
	for (const p of Array.isArray(profiles?.list) ? profiles.list : []) {
		if (isDid(p?.did) && !list.some((a) => a.did === p.did)) list.push({ did: p.did, ...(p.name?.startsWith('@') ? { handle: p.name.slice(1) } : {}) });
	}
	const old = store?.getItem(OLD_SESSION);
	if (!profiles && isDid(old)) list.push({ did: old });
	const inUse = profiles?.list?.find((/** @type {any} */ p) => p?.id === profiles.current)?.did;
	return { current: list.some((a) => a.did === inUse) ? inUse : list[0]?.did || null, list };
}

/** Whether accounts (or profiles, before them) were ever kept here, else an older sign-in may still be. */
export const accountsKept = (store = storage()) => Boolean(store?.getItem(KEY) || store?.getItem(PROFILES));

/** Read once per page: switching reloads it. @type {Accounts | null} */
let loaded = null;
export const accounts = () => (loaded ??= readAccounts());
/** The account in use, or null. */
export const currentAccount = () => accounts().current;

/** @param {(a: Accounts) => void} change */
function update(change) {
	const next = structuredClone(accounts());
	change(next);
	try {
		storage()?.setItem(KEY, JSON.stringify(next));
	} catch {
		// storage blocked: for this visit
	}
	loaded = next;
}

/**
 * An account signed in: added (or its handle updated) and made the one in use.
 * @param {string} did
 * @param {string} [handle]
 */
export function addAccount(did, handle) {
	update((a) => {
		const found = a.list.find((x) => x.did === did);
		if (found) {
			if (handle) found.handle = handle;
		} else a.list.push({ did, ...(handle ? { handle } : {}) });
		a.current = did;
	});
}

/** The account to use from now on (the caller reloads). @param {string} did */
export function useAccount(did) {
	update((a) => {
		if (a.list.some((x) => x.did === did)) a.current = did;
	});
}

/**
 * An account signed out, or its session gone: off the list; another one, if any, is used next.
 * @param {string} did
 */
export function removeAccount(did) {
	update((a) => {
		a.list = a.list.filter((x) => x.did !== did);
		if (a.current === did) a.current = a.list[0]?.did || null;
	});
}

/** For tests: forget what was read. */
export function resetAccounts() {
	loaded = null;
}
