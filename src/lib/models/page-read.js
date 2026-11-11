import socials from '#lib/data/socials.json' with { type: 'json' };
import providers from '#lib/data/providers.json' with { type: 'json' };
import { detectBoard } from '#lib/ats/detect.js';
import { keptUrl, keyOf } from './kept.js';
import { guessName } from './paste.js';

/**
 * What an organization's website says of it, read in the page itself (the browser add-on:
 * websites do not answer other sites, but a page can be read by an add-on the person runs).
 * @typedef {{url: string, title: string, metas: Record<string, string>, links: string[], careers?: string[]}} Collected
 *   what the page has, as collectPage gathers it: its meta tags by name or property, and every link,
 *   frame and script it points to; careers: links whose address or words say careers, jobs…
 * @typedef {{id: string, name: string, url: string}} Social
 * @typedef {{provider: string, id: string, url: string}} Board
 * @typedef {{link: string, key: string, name: string, description: string, careers: string, boards: Board[], socials: Social[]}} Read
 *   careers: its own careers page, when it links to one
 */

const SEPARATORS = /\s+[|–—·\-]\s+|:\s+/;
const MAX_TEXT = 1000;

/** Its own name: the site's name, else the part of its title its domain names, else from its domain. @param {Collected} page @param {string} key */
function nameOf(page, key) {
	const site = (page.metas['og:site_name'] || page.metas['application-name'] || '').trim();
	if (site) return site;
	const label = key.split('.')[0]?.toLowerCase() || '';
	const parts = page.title.split(SEPARATORS).map((p) => p.trim()).filter(Boolean);
	const named = parts.find((p) => label && p.toLowerCase().replace(/[^a-z0-9]/g, '').includes(label.replace(/[^a-z0-9]/g, '')));
	if (named && named.length <= 60) return named;
	return key ? guessName(key) : parts[0] || '';
}

/** The job boards it links to, the most linked first. @param {string[]} links */
function boardsOf(links) {
	/** @type {Map<string, {board: Board, count: number}>} */
	const found = new Map();
	for (const link of links) {
		const board = detectBoard(link);
		if (!board) continue;
		const id = `${board.provider}:${board.id.toLowerCase()}`;
		const known = found.get(id);
		if (known) known.count++;
		else {
			const url = providers.find((p) => p.id === board.provider)?.board.replace('{id}', board.id) || link;
			found.set(id, { board: { ...board, url }, count: 1 });
		}
	}
	return [...found.values()].sort((a, b) => b.count - a.count).map((f) => f.board);
}

const patterns = socials.socials.map((s) => ({ ...s, re: new RegExp(s.path, 'i') }));

/** Its social profiles, the first link to each network. @param {string[]} links */
function socialsOf(links) {
	/** @type {Social[]} */
	const found = [];
	for (const link of links) {
		let url;
		try {
			url = new URL(link);
		} catch {
			continue;
		}
		const host = url.hostname.toLowerCase().replace(/^(www|m)\./, '');
		const social = patterns.find((s) => s.hosts.includes(host));
		if (!social || found.some((f) => f.id === social.id)) continue;
		const path = url.pathname.match(social.re)?.[0];
		if (path) found.push({ id: social.id, name: social.name, url: `https://${host}${path}` });
	}
	return found;
}

/**
 * Its careers page: on its own site (or a careers subdomain), else a job board's page; never
 * another organization's site.
 * @param {string[]} links
 * @param {string} key its domain
 */
function careersOf(links, key) {
	const own = (/** @type {string} */ link) => {
		try {
			const host = new URL(link).hostname.replace(/^www\./, '');
			return Boolean(key) && (host === key || host.endsWith(`.${key}`));
		} catch {
			return false;
		}
	};
	return links.find(own) || links.find((l) => detectBoard(l)) || '';
}

/**
 * @param {Collected} page
 * @returns {Read | null} null for a page that is not on the web (about:, a file…)
 */
export function readPage(page) {
	let origin;
	try {
		const url = new URL(page.url);
		if (!/^https?:$/.test(url.protocol)) return null;
		origin = url.origin;
	} catch {
		return null;
	}
	const link = keptUrl(origin);
	if (!link) return null;
	// A page on a platform (a group, a profile) is kept as it is; a website by its home.
	const key = keyOf(page.url) ? keyOf(link) : '';
	const kept = key ? link : keptUrl(page.url) || link;
	const metas = Object.fromEntries(Object.entries(page.metas || {}).map(([k, v]) => [k.toLowerCase(), String(v)]));
	const links = (page.links || []).filter((l) => typeof l === 'string');
	return {
		link: kept,
		key,
		careers: careersOf(page.careers || [], key),
		name: nameOf({ ...page, title: String(page.title || ''), metas }, key),
		description: (metas['og:description'] || metas.description || '').trim().slice(0, MAX_TEXT),
		boards: boardsOf([page.url, ...links]),
		socials: socialsOf(links)
	};
}
