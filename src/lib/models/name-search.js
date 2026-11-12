import { toDomain } from './company.js';
import { safeUrl } from './url.js';

/**
 * Finding an organization from its name, in the browser: what a search box's words say
 * ("spacex greenhouse": a name at a job board provider), what Wikidata answers (an
 * organization with its official website and social accounts), and the board ids a name may
 * have at the providers. Pure: the requests are network/name-search.js's.
 * @typedef {{id: string, name: string, board: string}} Provider as in data/providers.json
 * @typedef {{label: string, href: string}} Social
 * @typedef {{id: string, name: string, description: string, url: string, domain: string, socials: Social[]}} Found
 */

/** Plain lowercase letters and digits, accents gone ("Médecins du Monde" → "medecinsdumonde"). @param {string} text @param {string} [join] */
export function slugOf(text, join = '') {
	return text
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.split(/[^a-z0-9]+/)
		.filter(Boolean)
		.join(join);
}

/**
 * Words that name a provider and an organization ("spacex greenhouse", "greenhouse spacex",
 * "spacex at greenhouse"): its board there, to open. No request: the page opened reads it.
 * @param {string} text
 * @param {Provider[]} providers
 * @returns {{provider: Provider, id: string, url: string} | null}
 */
export function providerQuery(text, providers) {
	const words = text.trim().toLowerCase().split(/\s+/).filter(Boolean);
	if (words.length < 2) return null;
	const at = words.findIndex((w) => providers.some((p) => p.id === w || slugOf(p.name) === w));
	if (at < 0) return null;
	const provider = /** @type {Provider} */ (providers.find((p) => p.id === words[at] || slugOf(p.name) === words[at]));
	const id = slugOf(words.filter((w, i) => i !== at && w !== 'at' && w !== 'on').join(' '));
	if (!id) return null;
	return { provider, id, url: provider.board.replace('{id}', id) };
}

/**
 * The ids an organization's board may have, from its name and its domain: "spacex",
 * "medecinsdumonde", "medecins-du-monde"; a few, most likely first.
 * @param {string} name
 * @param {string} [domain]
 */
export function boardIdsOf(name, domain = '') {
	const label = domain.split('.').slice(0, -1).join('-');
	return [...new Set([slugOf(label), slugOf(name), slugOf(name, '-')].filter((id) => id.length >= 2))].slice(0, 3);
}

/**
 * The social accounts Wikidata gives an organization, as links.
 * @param {Record<string, any[]>} claims
 * @param {Record<string, string>} socials property → link pattern ("mastodon": user@server)
 * @returns {Social[]}
 */
export function socialsOf(claims, socials) {
	/** @type {Social[]} */
	const out = [];
	for (const [property, pattern] of Object.entries(socials)) {
		const value = claims?.[property]?.[0]?.mainsnak?.datavalue?.value;
		if (typeof value !== 'string' || !value) continue;
		let href = '';
		if (pattern === 'mastodon') {
			const [user, server] = value.replace(/^@/, '').split('@');
			href = user && server ? `https://${server}/@${user}` : '';
		} else href = pattern.replace('{id}', encodeURIComponent(value));
		const safe = safeUrl(href);
		if (safe) out.push({ label: new URL(safe).hostname.replace(/^www\./, ''), href: safe });
	}
	return out;
}

/**
 * The organizations a Wikidata search found, with their official website (P856); those
 * without one are left out (nothing to open).
 * @param {{search?: {id: string}[]}} search wbsearchentities' answer
 * @param {{entities?: Record<string, any>}} entities wbgetentities' answer
 * @param {string} lang
 * @param {Record<string, string>} socials
 * @returns {Found[]}
 */
export function foundOf(search, entities, lang, socials) {
	/** @type {Found[]} */
	const out = [];
	for (const { id } of search?.search || []) {
		const entity = entities?.entities?.[id];
		if (!entity) continue;
		const sites = (entity.claims?.P856 || []).map((/** @type {any} */ c) => safeUrl(c?.mainsnak?.datavalue?.value)).filter(Boolean);
		const url = sites[0];
		if (!url) continue;
		const pick = (/** @type {Record<string, {value: string}>} */ texts) => texts?.[lang]?.value || texts?.en?.value || Object.values(texts || {})[0]?.value || '';
		const domain = toDomain(url);
		if (!domain || out.some((f) => f.domain === domain)) continue;
		out.push({ id, name: pick(entity.labels) || domain, description: pick(entity.descriptions), url, domain, socials: socialsOf(entity.claims, socials) });
	}
	return out;
}
