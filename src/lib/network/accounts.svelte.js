import { getSnapshotAccounts } from './snapshot.js';

/**
 * The companies on Bluesky (their domain is their handle), read once, when first asked.
 * @typedef {import('./snapshot.js').BlueskyAccount} BlueskyAccount
 */

/** @type {Map<string, BlueskyAccount>} */
let accounts = $state.raw(new Map());
let asked = false;

function read() {
	if (asked) return;
	asked = true;
	getSnapshotAccounts().then((found) => (accounts = found));
}

/** A company's own Bluesky account. @param {string} key its domain */
export function accountOf(key) {
	read();
	return accounts.get(key);
}

/** Every company on Bluesky. */
export function allAccounts() {
	read();
	return accounts;
}

/**
 * A smaller copy of a Bluesky picture, for lists.
 * @param {string} url
 */
export function thumbnail(url) {
	return url.replace('/img/avatar/plain/', '/img/avatar_thumbnail/plain/');
}
