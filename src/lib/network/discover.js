import { boardName } from '#lib/ats/board-check.js';
import { detectBoard } from '#lib/ats/detect.js';
import { keyOf } from '#lib/models/kept.js';
import { bluesky } from './bluesky-account.js';

/**
 * What a browser can learn of an organization from a link, by itself, asking only
 * those who answer browsers: its Bluesky account (when its domain is its handle, or the
 * link is its Bluesky profile) and its job board (the name the board gives it). Its jobs
 * are read by the page, from the board. Websites do not answer browsers: their own
 * name and links are left to whoever adds the organization (or the bookmarklet).
 * Each link is asked once a visit.
 * @typedef {import('./bluesky-account.js').BlueskyFound} BlueskyFound
 * @typedef {{key: string, board: {provider: string, id: string} | null, boardName: string, bluesky: BlueskyFound | null}} Found
 */

/** @type {Map<string, Promise<Found>>} */
const asked = new Map();

/** The Bluesky handle a link names: its profile's, or its domain. @param {string} link @param {string} key */
function handleOf(link, key) {
	try {
		const url = new URL(link);
		const profile = /^(www\.)?bsky\.app$/.test(url.hostname) && url.pathname.match(/^\/profile\/([^/]+)/);
		if (profile) return decodeURIComponent(profile[1]);
	} catch {
		// not a link: nothing to ask
	}
	return key;
}

/**
 * @param {string} link a kept organization's (models/kept.js keptUrl)
 * @returns {Promise<Found>}
 */
export function discover(link) {
	let found = asked.get(link);
	if (!found) {
		const key = keyOf(link);
		const board = detectBoard(link);
		found = Promise.all([board ? boardName(board) : Promise.resolve(''), bluesky(handleOf(link, key))]).then(([name, account]) => ({
			key,
			board,
			boardName: name,
			bluesky: account
		}));
		asked.set(link, found);
	}
	return found;
}
