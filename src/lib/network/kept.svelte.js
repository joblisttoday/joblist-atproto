import config from '#lib/data/config.json';
import { localKey } from '#lib/local/space.js';
import { keptUrl, keyOf, readKept, withKept } from '#lib/models/kept.js';
import { SAVED, localLists, removeLocalList } from './local-lists.svelte.js';

/**
 * The organizations kept in this browser (models/kept.js): private, never sent anywhere.
 * They began as a private list, "Saved organizations": its organizations are kept here,
 * once, and the list is gone.
 * @typedef {import('#lib/models/kept.js').Kept} Kept
 */

const KEY = localKey('joblist.kept.v1');

/** @returns {Kept[]} */
function read() {
	try {
		const text = localStorage.getItem(KEY);
		if (text !== null) return readKept(JSON.parse(text));
	} catch {
		return [];
	}
	// The first time: the organizations saved before, as links to their domains.
	const saved = localLists.records.find((r) => r.rkey === SAVED);
	/** @type {string[]} */
	const keys = saved?.value.companies || [];
	const at = saved?.value.createdAt || '';
	return readKept(keys.map((key) => ({ url: `https://${key}`, name: '', at })));
}

export const kept = $state({ list: read() });
// Moved: written here, and the old list removed.
if (localLists.records.some((r) => r.rkey === SAVED)) {
	write();
	removeLocalList(SAVED);
}

function write() {
	try {
		localStorage.setItem(KEY, JSON.stringify(kept.list));
	} catch {
		// storage full or blocked: kept until the page closes
	}
}

/**
 * Keeps a link (or renames it, kept already). False when it is not a link, or there are too many.
 * @param {string} input
 * @param {string} [name]
 */
export function keep(input, name = '') {
	const url = keptUrl(input);
	if (!url) return false;
	if (!kept.list.some((k) => k.url === url) && kept.list.length >= config.kept.max) return false;
	kept.list = withKept(kept.list, url, name, new Date().toISOString());
	write();
	return true;
}

/** @param {string} url */
export function forget(url) {
	kept.list = kept.list.filter((k) => k.url !== url);
	write();
}

/** Whether a link is kept. @param {string} link */
export const isKeptLink = (link) => kept.list.some((k) => k.url === link);

/** Whether an organization joblist knows is kept (by its domain). @param {string} key */
export const isKept = (key) => kept.list.some((k) => keyOf(k.url) === key);

/**
 * The Save of an organization's page or card: kept by its domain, or forgotten.
 * @param {{key: string, name: string}} company
 */
export function toggleKept({ key, name }) {
	const found = kept.list.filter((k) => keyOf(k.url) === key);
	if (found.length) {
		kept.list = kept.list.filter((k) => !found.includes(k));
		write();
	} else keep(`https://${key}`, name);
}
