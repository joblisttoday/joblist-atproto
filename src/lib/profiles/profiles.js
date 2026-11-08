/**
 * Profiles: separate spaces in this browser for what someone keeps (saved jobs,
 * collections, searches, drafts): "Personal", "For a friend"… each optionally
 * signed in to one atproto account. They keep things apart, not secret: anyone
 * using this browser can open them.
 *
 * A store keeps its data under scoped(key): the first profile under the key itself
 * (what was kept before profiles), the others under "key:id". Switching profile
 * reloads the page, so each store simply reads its own key when it starts.
 *
 * @typedef {{id: string, name: string, did?: string}} Profile
 * @typedef {{current: string, list: Profile[]}} Profiles
 */

const KEY = 'joblist.profiles.v1';
/** Before profiles: the account signed in ("none" when signed out). */
const OLD_SESSION = 'joblist.session.v1';
export const FIRST = 'default';

/** @returns {Storage | null} */
function storage() {
	try {
		return localStorage;
	} catch {
		return null;
	}
}

/**
 * The profiles, checked; the first one always there.
 * @param {Storage | null} [store]
 * @returns {Profiles}
 */
export function readProfiles(store = storage()) {
	/** @type {any} */
	let saved = null;
	try {
		saved = JSON.parse(store?.getItem(KEY) || 'null');
	} catch {
		saved = null;
	}
	const list = (Array.isArray(saved?.list) ? saved.list : [])
		.filter((/** @type {any} */ p) => p && typeof p.id === 'string' && /^[\w:.-]{1,80}$/.test(p.id))
		.map((/** @type {any} */ p) => ({ id: p.id, name: String(p.name || '').slice(0, 60), ...(typeof p.did === 'string' && p.did.startsWith('did:') ? { did: p.did } : {}) }));
	if (!list.some((/** @type {Profile} */ p) => p.id === FIRST)) {
		// Signed in before profiles existed: that account is the first profile's.
		const old = store?.getItem(OLD_SESSION);
		list.unshift({ id: FIRST, name: '', ...(old && old.startsWith('did:') ? { did: old } : {}) });
	}
	const current = list.some((/** @type {Profile} */ p) => p.id === saved?.current) ? saved.current : FIRST;
	return { current, list };
}

/** @param {Profiles} profiles @param {Storage | null} [store] */
export function writeProfiles(profiles, store = storage()) {
	try {
		store?.setItem(KEY, JSON.stringify(profiles));
	} catch {
		// storage blocked: one profile, for this visit
	}
}

/** Whether profiles were ever kept here (else this browser may still hold an older sign-in). */
export const profilesKept = (store = storage()) => Boolean(store?.getItem(KEY));

/** Read once per page: switching reloads it. @type {Profiles | null} */
let loaded = null;
export const profiles = () => (loaded ??= readProfiles());
/** @returns {Profile} */
export const currentProfile = () => /** @type {Profile} */ (profiles().list.find((p) => p.id === profiles().current));

/**
 * Where a store keeps its data for the current profile (or another).
 * @param {string} key
 * @param {string} [id]
 */
export function scoped(key, id = profiles().current) {
	return id === FIRST ? key : `${key}:${id}`;
}

/** @param {(p: Profiles) => void} change */
function update(change) {
	const next = structuredClone(profiles());
	change(next);
	writeProfiles(next);
	loaded = next;
}

/** A new profile, made current (the caller reloads). @param {string} name */
export function addProfile(name) {
	const id = `p${Date.now().toString(36)}`;
	update((p) => {
		p.list.push({ id, name: name.trim().slice(0, 60) });
		p.current = id;
	});
	return id;
}

/** @param {string} id @param {string} name */
export function renameProfile(id, name) {
	update((p) => {
		const found = p.list.find((x) => x.id === id);
		if (found) found.name = name.trim().slice(0, 60);
	});
}

/** The profile to use from now on (the caller reloads). @param {string} id */
export function useProfile(id) {
	update((p) => {
		if (p.list.some((x) => x.id === id)) p.current = id;
	});
}

/**
 * An account signed in: it belongs to the profile that has it already (made current),
 * else to the current one when that has none; a profile that has another account keeps
 * it, and this one gets a new profile (made current): one account per profile, never
 * swapped under what it kept. Returns whether the current profile changed (the page reloads).
 * @param {string} did
 * @param {string} [handle] names a profile that has no name
 */
export function attachAccount(did, handle) {
	const owner = profiles().list.find((p) => p.did === did);
	if (owner) {
		const moved = owner.id !== profiles().current;
		update((p) => {
			p.current = owner.id;
		});
		return moved;
	}
	if (currentProfile().did) {
		addProfile(handle ? `@${handle}` : '');
		update((p) => {
			/** @type {Profile} */ (p.list.find((x) => x.id === p.current)).did = did;
		});
		return true;
	}
	update((p) => {
		const current = /** @type {Profile} */ (p.list.find((x) => x.id === p.current));
		current.did = did;
		if (!current.name && handle) current.name = `@${handle}`;
	});
	return false;
}

/** An account signed out, or its session gone: its profile stays, without it. @param {string} did */
export function detachAccount(did) {
	update((p) => {
		for (const x of p.list) if (x.did === did) delete x.did;
	});
}

/**
 * A profile and everything it kept here, gone (not the first one). Its account, if any,
 * is the caller's to sign out.
 * @param {string} id
 * @param {Storage | null} [store]
 */
export function removeProfile(id, store = storage()) {
	if (id === FIRST) return;
	if (store) {
		const own = [];
		for (let i = 0; i < store.length; i++) {
			const key = store.key(i);
			if (key?.endsWith(`:${id}`)) own.push(key);
		}
		for (const key of own) store.removeItem(key);
	}
	update((p) => {
		p.list = p.list.filter((x) => x.id !== id);
		if (p.current === id) p.current = FIRST;
	});
}

/** For tests: forget what was read. */
export function resetProfiles() {
	loaded = null;
}
