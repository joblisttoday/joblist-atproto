import config from '#lib/data/config.json';
import { boardName } from '#lib/ats/board-check.js';
import { detectBoard } from '#lib/ats/detect.js';
import { keyOf } from '#lib/models/kept.js';

/**
 * What a browser can learn of an organization from a link, by itself, asking only
 * those who answer browsers: its Bluesky account (when its domain is its handle, or the
 * link is its Bluesky profile) and its job board (the name the board gives it). Its jobs
 * are read by the page, from the board. Websites do not answer browsers: their own
 * name and links are left to whoever adds the organization (or the bookmarklet).
 * Each link is asked once a visit.
 * @typedef {{did: string, handle: string, name: string, avatar: string, description: string, followers: number}} BlueskyFound
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

/** @param {string} handle @returns {Promise<BlueskyFound | null>} */
async function bluesky(handle) {
	if (!handle || !handle.includes('.')) return null;
	try {
		const base = config.services.appview;
		const resolved = await fetch(`${base}/xrpc/com.atproto.identity.resolveHandle?handle=${encodeURIComponent(handle)}`);
		if (!resolved.ok) return null;
		const { did } = await resolved.json();
		const res = await fetch(`${base}/xrpc/app.bsky.actor.getProfile?actor=${encodeURIComponent(did)}`);
		if (!res.ok) return null;
		const p = await res.json();
		// The handle the AppView verified (the domain names the account, and back).
		if (p.handle !== handle.toLowerCase()) return null;
		return {
			did,
			handle: p.handle,
			name: String(p.displayName || '').trim(),
			avatar: String(p.avatar || ''),
			description: String(p.description || '').trim(),
			followers: Number(p.followersCount) || 0
		};
	} catch {
		return null;
	}
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
