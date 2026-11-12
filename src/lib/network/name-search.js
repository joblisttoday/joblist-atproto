import config from '#lib/data/config.json';
import providers from '#lib/data/providers.json';
import { checkBoard } from '#lib/ats/board-check.js';
import { getJson } from '#lib/ats/job.js';
import { mapLimit } from '#lib/atproto/xrpc.js';
import { keep as store, readKept as stored } from '#lib/local/store.js';
import { boardIdsOf, foundOf, slugOf } from '#lib/models/name-search.js';

/**
 * Finding an organization from its name, from this browser: Wikidata (its official website
 * and social accounts) and Bluesky's account search, asked once per name and kept here
 * (config.nameSearch.cacheDays), so a name is not asked again, and is there offline. Its job
 * board, by its name at each provider, only when asked (findBoards).
 * @typedef {import('#lib/models/name-search.js').Found} Found
 * @typedef {{handle: string, name: string, avatar?: string}} Account
 * @typedef {{found: Found[], accounts: Account[]}} NameResults
 */

const { nameSearch } = config;
const DAY = 24 * 3600 * 1000;

/** @param {string} key @returns {Promise<any>} */
async function cached(key) {
	const kept = /** @type {{at: number, value: any} | null} */ (await stored(key).catch(() => null));
	return kept && Date.now() - kept.at < nameSearch.cacheDays * DAY ? kept.value : null;
}

/** @param {Record<string, string | number>} params */
const wikidata = (params) => `${nameSearch.wikidata}?${new URLSearchParams({ ...params, format: 'json', origin: '*' })}`;

/**
 * Organizations and accounts a name may be.
 * @param {string} text
 * @param {string} lang
 * @returns {Promise<NameResults>}
 */
export async function searchName(text, lang) {
	const name = text.trim();
	const key = `name-search.v1:${lang}:${slugOf(name, ' ')}`;
	const known = await cached(key);
	if (known) return known;
	const [search, typeahead] = await Promise.all([
		getJson(wikidata({ action: 'wbsearchentities', search: name, language: lang, uselang: lang, type: 'item', limit: nameSearch.shown })),
		getJson(`${nameSearch.bluesky}?${new URLSearchParams({ q: name, limit: String(nameSearch.shown) })}`)
	]);
	const ids = (search?.search || []).map((/** @type {{id: string}} */ s) => s.id);
	const entities = ids.length ? await getJson(wikidata({ action: 'wbgetentities', ids: ids.join('|'), props: 'labels|descriptions|claims', languages: `${lang}|en` })) : null;
	const found = foundOf(search, entities, lang, nameSearch.socials);
	/** @type {Account[]} */
	const accounts = (typeahead?.actors || []).map((/** @type {any} */ a) => ({ handle: a.handle, name: a.displayName || a.handle, avatar: a.avatar }));
	/** @type {NameResults} */
	const value = { found, accounts };
	// Nothing answered (offline): not kept, asked again next time.
	if (search || typeahead) {
		store(key, { at: Date.now(), value });
		for (const f of found) store(`name-found.v1:${f.domain}`, { at: Date.now(), value: f });
	}
	return value;
}

/**
 * What a name search found of a domain (its social accounts), kept here: nothing is asked.
 * @param {string} domain
 * @returns {Promise<Found | null>}
 */
export function foundFor(domain) {
	return cached(`name-found.v1:${domain}`);
}

/**
 * Its job boards, by the ids its name and domain may have at each provider (a few ids, the
 * likeliest first, stopping at the first that has any): only boards with open jobs count
 * (some providers answer for any name). Asked only when someone asks.
 * @param {string} name
 * @param {string} [domain]
 * @returns {Promise<{provider: string, id: string, count: number}[]>}
 */
export async function findBoards(name, domain) {
	for (const id of boardIdsOf(name, domain)) {
		const read = await mapLimit(providers, config.limits.jobsConcurrency, async (/** @type {{id: string}} */ p) => {
			const found = await checkBoard({ provider: p.id, id }).catch(() => null);
			return found?.count ? { provider: p.id, id, count: found.count } : null;
		});
		const boards = read.filter((b) => b !== null);
		if (boards.length) return boards;
	}
	return [];
}
