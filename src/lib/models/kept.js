import platforms from '#lib/data/platforms.json' with { type: 'json' };
import { tlds } from '#lib/data/tlds.json' with { type: 'json' };
import { detectBoard } from '#lib/ats/detect.js';
import providers from '#lib/data/providers.json' with { type: 'json' };

/**
 * Organizations someone keeps to watch, private in their browser: any link (a website,
 * a job board, a social profile, a group), with a name if they gave one. joblist shows
 * an organization it knows (by the link's domain, or its job board), else the link.
 * @typedef {{provider: string, id: string}} Board
 * @typedef {{url: string, name: string, at: string, tags?: string[], board?: Board}} Kept
 *   tags: private words to sort them (design, coop, berlin), never published;
 *   board: its job board, as found when it was saved (its link may be its website)
 * @typedef {{key: string, name: string, jobBoard?: import('./company.js').JobBoard}} Known an organization joblist knows
 * @typedef {{link: string, suggest: string, account?: {handle: string, avatar?: string, followers?: number}}} Local
 *   one only a browser knows, on its page: the link it is kept by, the add form filled in, its Bluesky account
 */

const PLATFORMS = new Set(platforms.hosts);
const TLDS = new Set(tlds);
const MAX_URL = 2048;
const MAX_NAME = 200;
const MAX_TAGS = 20;
const MAX_TAG = 40;

/**
 * Tags as kept: lowercase words (inner spaces as "-"), each once, at most 20.
 * @param {unknown} tags
 * @returns {string[]}
 */
export function cleanTags(tags) {
	if (!Array.isArray(tags)) return [];
	const words = tags
		.filter((t) => typeof t === 'string')
		.map((t) => t.trim().toLowerCase().replace(/^#/, '').replace(/\s+/g, '-').slice(0, MAX_TAG))
		.filter(Boolean);
	return [...new Set(words)].slice(0, MAX_TAGS);
}

/** A link's host, without "www.". @param {URL} url */
const hostOf = (url) => url.hostname.toLowerCase().replace(/^www\./, '');

/**
 * Whether a name is a domain: labels of letters, digits and inner hyphens, ending with a
 * top-level domain that exists (src/lib/data/tlds.json, IANA's): gitlab.com, not test.env,
 * llms.txt or fake.no-tld.
 * @param {string} host
 */
export function isDomain(host) {
	const labels = host.toLowerCase().replace(/\.$/, '').split('.');
	if (labels.length < 2 || host.length > 253) return false;
	if (!labels.every((l) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(l))) return false;
	return TLDS.has(/** @type {string} */ (labels.at(-1)));
}

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
 * Where an organization typed or pasted as a link opens: joblist's page of one it knows,
 * else its domain's page (/{domain}: what a browser finds of it), else the page of the link
 * itself (a job board, a social profile). sure: it is plainly a link or a domain, not words.
 * @param {string} input
 * @param {(link: string) => Known | undefined} known see knownBy
 * @returns {{href: string, name: string, known: boolean, sure: boolean} | null}
 */
export function organizationPage(input, known) {
	const text = input.trim();
	const link = keptUrl(text);
	// A link's host is a domain that exists (not test.env, not llms.txt).
	if (!link || !isDomain(new URL(link).hostname)) return null;
	const sure = /^[a-z][a-z0-9+.-]*:\/\//i.test(text) || text.includes('/') || /\.[a-z]{2,}$/i.test(text);
	const found = known(link);
	if (found) return { href: `/${found.key}`, name: found.name, known: true, sure };
	const key = keyOf(link);
	const home = new URL(link).pathname === '/' && !new URL(link).search;
	const name = link.replace(/^https?:\/\/(www\.)?/, '');
	if (key && home) return { href: `/${key}`, name, known: false, sure };
	return { href: `/explore/organization#${new URLSearchParams({ url: link })}`, name, known: false, sure };
}

/**
 * A job board as kept: a provider joblist reads, and an id; else none.
 * @param {unknown} board
 * @returns {Board | undefined}
 */
export function cleanBoard(board) {
	const b = /** @type {any} */ (board);
	if (!b || typeof b.provider !== 'string' || typeof b.id !== 'string' || !b.id || b.id.length > 256) return undefined;
	return providers.some((p) => p.id === b.provider) ? { provider: b.provider, id: b.id } : undefined;
}

/**
 * A kept organization's job board: the one found when it was saved, else its link's own.
 * @param {Kept} item
 * @returns {Board | undefined}
 */
export function boardOfKept(item) {
	return item.board || detectBoard(item.url) || undefined;
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
		const tags = cleanTags(item.tags);
		const board = cleanBoard(item.board);
		list.push({
			url,
			name: typeof item.name === 'string' ? item.name.trim().slice(0, MAX_NAME) : '',
			at: typeof item.at === 'string' ? item.at : '',
			...(tags.length ? { tags } : {}),
			...(board ? { board } : {})
		});
	}
	return list;
}

/**
 * One kept organization added (first), or its name updated when it is kept already.
 * @param {Kept[]} list
 * @param {string} url checked (keptUrl)
 * @param {string} name
 * @param {string} at
 * @param {unknown} [board] its job board, when found
 * @returns {Kept[]}
 */
export function withKept(list, url, name, at, board) {
	const clean = cleanBoard(board);
	const found = list.find((k) => k.url === url);
	if (found) return list.map((k) => (k === found ? { ...k, name: name.trim().slice(0, MAX_NAME) || k.name, ...(clean ? { board: clean } : {}) } : k));
	return [{ url, name: name.trim().slice(0, MAX_NAME), at, ...(clean ? { board: clean } : {}) }, ...list];
}

/**
 * A kept organization's tags, replaced (none: no tags).
 * @param {Kept[]} list
 * @param {string} url
 * @param {string[]} tags
 * @returns {Kept[]}
 */
export function withTags(list, url, tags) {
	const clean = cleanTags(tags);
	return list.map((k) => {
		if (k.url !== url) return k;
		const { tags: _, ...rest } = k;
		return clean.length ? { ...rest, tags: clean } : rest;
	});
}

/**
 * Changes made away from the list (the browser add-on, while joblist.today is not open),
 * in the order they were made: keep (with a name and tags), forget, or tag.
 * @typedef {{op: 'keep', url: string, name?: string, tags?: string[], board?: Board, at: string} | {op: 'forget', url: string, at: string} | {op: 'tags', url: string, tags: string[], at: string}} Change
 */

/**
 * The list once the changes are made, in order; a change that is not one is left out.
 * @param {Kept[]} list
 * @param {unknown} changes
 * @returns {Kept[]}
 */
export function applyChanges(list, changes) {
	let next = list;
	for (const change of Array.isArray(changes) ? changes : []) {
		const url = typeof change?.url === 'string' ? keptUrl(change.url) : null;
		if (!url) continue;
		const at = typeof change.at === 'string' ? change.at : '';
		if (change.op === 'keep') {
			next = withKept(next, url, typeof change.name === 'string' ? change.name : '', at, change.board);
			if (Array.isArray(change.tags)) next = withTags(next, url, change.tags);
		} else if (change.op === 'forget') next = next.filter((k) => k.url !== url);
		else if (change.op === 'tags') next = withTags(next, url, change.tags);
	}
	return next;
}

/** Every tag of the kept organizations, the most used first. @param {Kept[]} list */
export function keptTags(list) {
	/** @type {Map<string, number>} */
	const counts = new Map();
	for (const k of list) for (const tag of k.tags || []) counts.set(tag, (counts.get(tag) || 0) + 1);
	return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([tag]) => tag);
}

/**
 * Two sets of kept organizations as one: each link once, its name the first given, its tags
 * both's, at most config.kept.max (those of the first first).
 * @param {Kept[]} list
 * @param {Kept[]} more
 * @param {number} max
 * @returns {Kept[]}
 */
export function mergeKept(list, more, max) {
	/** @type {Map<string, Kept>} */
	const by = new Map(list.map((k) => [k.url, k]));
	for (const k of more) {
		const here = by.get(k.url);
		if (!here) by.set(k.url, k);
		else {
			const tags = cleanTags([...(here.tags || []), ...(k.tags || [])]);
			by.set(k.url, { ...here, name: here.name || k.name, ...(tags.length ? { tags } : {}) });
		}
	}
	return [...by.values()].slice(0, max);
}

/**
 * The private lists of organizations kept before (joblist.lists.v1, and the files that moved
 * them), as kept organizations: links to their domains, each tagged with its list's name;
 * those of "Saved organizations" (rkey "lsaved") without a tag.
 * @param {unknown} lists [{rkey, value: {name, companies, createdAt}}]
 * @returns {Kept[]}
 */
export function listsToKept(lists) {
	if (!Array.isArray(lists)) return [];
	/** @type {Kept[]} */
	let all = [];
	for (const list of lists) {
		const value = list?.value;
		const keys = Array.isArray(value?.companies) ? value.companies : [];
		const at = typeof value?.createdAt === 'string' ? value.createdAt : '';
		const tags = list?.rkey === 'lsaved' || typeof value?.name !== 'string' ? [] : cleanTags([value.name]);
		const found = readKept(keys.map((/** @type {unknown} */ key) => ({ url: `https://${key}`, name: '', at, tags })));
		all = mergeKept(all, found, Infinity);
	}
	return all;
}
