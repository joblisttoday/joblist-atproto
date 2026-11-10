import { mergeCollections } from '#lib/models/job-collection.js';
import { cleanCollections } from '#lib/models/job-collection-check.js';
import { searchId } from '#lib/models/saved-search.js';

/**
 * One private space in this browser: saved jobs, searches, lists and drafts, whichever
 * Bluesky account is signed in (accounts are only for publishing). Profiles used to keep
 * separate spaces, each under "key:id": the first time this runs, theirs are merged into
 * the one space (nothing is lost), then removed.
 */

const DONE = 'joblist.space.v1';
/** An older profile's copy of a store: "joblist.searches.v1:p1abc". */
const PROFILE_KEY = /^(joblist\.[\w.]+):([\w.-]{1,80})$/;

/** @param {string | null} text @param {any} fallback */
function parse(text, fallback) {
	try {
		return text ? JSON.parse(text) : fallback;
	} catch {
		return fallback;
	}
}

/**
 * Two copies of one store as one, or null for a store that is not merged (a draft:
 * the space's own stays).
 * @param {string} base the store's key
 * @param {string | null} mine
 * @param {string} theirs
 * @returns {string | null}
 */
export function mergeStore(base, mine, theirs) {
	if (base === 'joblist.searches.v1') {
		const list = [...parse(mine, []), ...parse(theirs, [])].filter((s) => s && typeof s === 'object');
		const seen = new Set();
		return JSON.stringify(list.filter((s) => !seen.has(searchId(s)) && seen.add(searchId(s))));
	}
	if (base === 'joblist.collections.v1') {
		const a = cleanCollections(parse(mine, { collections: [] })).value;
		const b = cleanCollections(parse(theirs, { collections: [] })).value;
		return JSON.stringify(mergeCollections(a, b));
	}
	if (base === 'joblist.lists.v1') {
		/** @type {any[]} */
		const lists = parse(mine, []).filter((/** @type {any} */ r) => r?.rkey);
		for (const record of parse(theirs, [])) {
			if (!record?.rkey) continue;
			const same = lists.find((r) => r.rkey === record.rkey);
			// The same key (Saved organizations, in both): one list with the organizations of both.
			if (same) same.value = { ...same.value, companies: [...new Set([...(same.value.companies || []), ...(record.value?.companies || [])])] };
			else lists.push(record);
		}
		return JSON.stringify(lists);
	}
	return mine ?? (base.endsWith('Draft.v1') ? null : theirs);
}

/**
 * Merge every older profile's stores into the one space, once.
 * @param {Storage} store
 */
export function mergeProfiles(store) {
	if (store.getItem(DONE)) return;
	const copies = [];
	for (let i = 0; i < store.length; i++) {
		const key = store.key(i);
		const found = key && PROFILE_KEY.exec(key);
		if (found) copies.push({ key: /** @type {string} */ (key), base: found[1] });
	}
	for (const { key, base } of copies) {
		const merged = mergeStore(base, store.getItem(base), /** @type {string} */ (store.getItem(key)));
		if (merged !== null) store.setItem(base, merged);
		store.removeItem(key);
	}
	store.setItem(DONE, '1');
}

let ready = false;

/**
 * Where a store keeps its data: its key, once older profiles are merged into it.
 * @param {string} key
 */
export function localKey(key) {
	if (!ready) {
		ready = true;
		try {
			mergeProfiles(localStorage);
		} catch {
			// storage blocked: nothing kept to merge
		}
	}
	return key;
}
