import config from '#lib/data/config.json';
import { localKey } from '#lib/local/space.js';
import { keptUrl, keyOf, listsToKept, mergeKept, readKept, withKept, withTags } from '#lib/models/kept.js';

/**
 * The organizations kept in this browser (models/kept.js): private, never sent anywhere.
 * They began as private lists of organizations (joblist.lists.v1): those are kept here once,
 * each tagged with its list's name, and the lists are gone.
 * The joblist browser add-on (extension/) keeps them too, on any website: when this site
 * is open, it makes its changes here and tells ("joblist:kept"), and is told of each change
 * made here ("joblist:kept-written"), so both are one list.
 * @typedef {import('#lib/models/kept.js').Kept} Kept
 */

const KEY = localKey('joblist.kept.v1');
const LISTS = localKey('joblist.lists.v1');

/** @returns {Kept[]} */
function read() {
	try {
		return readKept(JSON.parse(localStorage.getItem(KEY) || '[]'));
	} catch {
		return [];
	}
}

export const kept = $state({ list: read() });
// The private lists of organizations kept before, once: their organizations, tagged.
try {
	const lists = localStorage.getItem(LISTS);
	if (lists !== null) {
		kept.list = mergeKept(kept.list, listsToKept(JSON.parse(lists)), config.kept.max);
		write();
		localStorage.removeItem(LISTS);
	}
} catch {
	// storage blocked, or not lists: nothing to move
}

/**
 * Organizations from elsewhere (a file from another device) added to these.
 * @param {Kept[]} more
 */
export function keepAll(more) {
	kept.list = mergeKept(kept.list, more, config.kept.max);
	write();
}

function write() {
	try {
		localStorage.setItem(KEY, JSON.stringify(kept.list));
	} catch {
		// storage full or blocked: kept until the page closes
	}
	if (typeof dispatchEvent === 'function') dispatchEvent(new CustomEvent('joblist:kept-written'));
}

// The add-on made its changes: read them back.
if (typeof addEventListener === 'function') addEventListener('joblist:kept', () => (kept.list = read()));

/**
 * A kept organization's tags, replaced.
 * @param {string} url
 * @param {string[]} tags
 */
export function tagKept(url, tags) {
	kept.list = withTags(kept.list, url, tags);
	write();
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
