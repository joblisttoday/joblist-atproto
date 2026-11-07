import config from '#lib/data/config.json';
import { scoped } from '#lib/profiles/profiles.js';
import { LOCAL } from '#lib/models/list.js';

/**
 * Lists kept on this device only (local first): private, never published, kept per
 * profile (profiles.js), as records of the same shape as published ones, by the
 * author "local", so the app shows and edits them like any other: their page is
 * /local/<key>. One can be published later, then it leaves this device.
 * @typedef {import('#lib/atproto/records.js').RepoRecord} RepoRecord
 */

export { LOCAL };
/** The current profile's. */
const KEY = scoped('joblist.lists.v1');

/** @returns {RepoRecord[]} */
function read() {
	try {
		const records = JSON.parse(localStorage.getItem(KEY) || '[]');
		return Array.isArray(records) ? records.filter((r) => r && typeof r.rkey === 'string' && r.value?.name) : [];
	} catch {
		return [];
	}
}

/** @type {{records: RepoRecord[]}} */
export const localLists = $state({ records: read() });

function write() {
	try {
		localStorage.setItem(KEY, JSON.stringify(localLists.records));
	} catch {
		// storage full or blocked: the lists last until the page closes
	}
}

/** @param {{did: string}} list */
export const isLocal = (list) => list.did === LOCAL;

/** A new key, as time-ordered as atproto's. */
export const newLocalKey = () => `l${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/**
 * @param {string} rkey
 * @param {Record<string, any>} value a list record (models/list.js toRecord)
 */
export function putLocalList(rkey, value) {
	const record = { uri: `at://${LOCAL}/${config.collections.list}/${rkey}`, cid: '', did: LOCAL, rkey, value: { ...value, open: false } };
	localLists.records = [...localLists.records.filter((r) => r.rkey !== rkey), record];
	write();
}

/** @param {string} rkey */
export function removeLocalList(rkey) {
	localLists.records = localLists.records.filter((r) => r.rkey !== rkey);
	write();
}
