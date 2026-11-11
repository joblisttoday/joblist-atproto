import platforms from '#lib/data/platforms.json' with { type: 'json' };
import { detectBoard } from '#lib/ats/detect.js';

/**
 * Organizations someone keeps to watch, private in their browser: any link (a website,
 * a job board, a social profile, a group), with a name if they gave one. joblist shows
 * an organization it knows (by the link's domain, or its job board), else the link.
 * @typedef {{url: string, name: string, at: string}} Kept
 * @typedef {{key: string, name: string, jobBoard?: import('./company.js').JobBoard}} Known an organization joblist knows
 */

const PLATFORMS = new Set(platforms.hosts);
const MAX_URL = 2048;
const MAX_NAME = 200;

/** A link's host, without "www.". @param {URL} url */
const hostOf = (url) => url.hostname.toLowerCase().replace(/^www\./, '');

/**
 * What was typed or pasted as a link (a bare domain too), or null when it is none.
 * @param {string} input
 * @returns {string | null}
 */
export function keptUrl(input) {
	const text = input.trim();
	if (!text || text.length > MAX_URL || /\s/.test(text)) return null;
	// Another kind of link (mailto:, javascript:): not a page to look at.
	if (/^[a-z][a-z0-9+.-]*:/i.test(text) && !/^https?:\/\//i.test(text)) return null;
	try {
		const url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(text) ? text : `https://${text}`);
		if (!/^https?:$/.test(url.protocol) || !url.hostname.includes('.') || url.username || url.password) return null;
		url.hash = '';
		const href = url.href;
		// A site's home is its domain: "https://acme.org/" and "acme.org" are the same.
		return url.pathname === '/' && !url.search ? href.slice(0, -1) : href;
	} catch {
		return null;
	}
}

/**
 * The organization a link names by its domain: none for a page on a platform
 * (facebook.com/groups/…), but the platform's own home is its organization (gitlab.com).
 * @param {string} link
 */
export function keyOf(link) {
	try {
		const url = new URL(link);
		if (detectBoard(link)) return '';
		const host = hostOf(url);
		const home = url.pathname === '/' && !url.search;
		return PLATFORMS.has(host) && !home ? '' : host;
	} catch {
		return '';
	}
}

/**
 * Finds the organization joblist knows for a link: by its domain, or by its job board.
 * @param {Map<string, Known>} companies by key
 * @returns {(link: string) => Known | undefined}
 */
export function knownBy(companies) {
	/** @type {Map<string, Known>} */
	const boards = new Map();
	for (const company of companies.values()) {
		const { provider, id, url } = company.jobBoard || {};
		const board = provider && id ? { provider, id } : url ? detectBoard(url) : null;
		if (board) boards.set(`${board.provider}:${board.id.toLowerCase()}`, company);
	}
	return (link) => {
		const key = keyOf(link);
		if (key && companies.has(key)) return companies.get(key);
		const board = detectBoard(link);
		return board ? boards.get(`${board.provider}:${board.id.toLowerCase()}`) : undefined;
	};
}

/**
 * The kept organizations read back, checked (they come from storage), each link once.
 * @param {unknown} data
 * @returns {Kept[]}
 */
export function readKept(data) {
	if (!Array.isArray(data)) return [];
	/** @type {Kept[]} */
	const list = [];
	for (const item of data) {
		const url = typeof item?.url === 'string' ? keptUrl(item.url) : null;
		if (!url || list.some((k) => k.url === url)) continue;
		list.push({ url, name: typeof item.name === 'string' ? item.name.trim().slice(0, MAX_NAME) : '', at: typeof item.at === 'string' ? item.at : '' });
	}
	return list;
}

/**
 * One kept organization added (first), or its name updated when it is kept already.
 * @param {Kept[]} list
 * @param {string} url checked (keptUrl)
 * @param {string} name
 * @param {string} at
 * @returns {Kept[]}
 */
export function withKept(list, url, name, at) {
	const found = list.find((k) => k.url === url);
	if (found) return list.map((k) => (k === found ? { ...k, name: name.trim().slice(0, MAX_NAME) || k.name } : k));
	return [{ url, name: name.trim().slice(0, MAX_NAME), at }, ...list];
}
