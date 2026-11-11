/**
 * One search box for everything, on every page: what someone types can be a
 * field or a city with its own page (/field/design, /in/berlin), a company, organizations'
 * tag (/companies#q=music), another place or words in job titles. Jobs are always one Enter away; the rest is
 * offered as they type.
 *
 * @typedef {{key: string, name: string, tags?: string[], href?: string}} QuickCompany
 * @typedef {{slug: string, name: string, count: number}} QuickPage a city's or a field's page; name: as shown (a field's, in the reader's language)
 * @typedef {{fields: QuickPage[], cities: QuickPage[], companies: QuickCompany[], tags: [string, number][], places: string[]}} QuickResults
 */
import { slugify } from './landing.js';

/** @param {string} text */
export const fold = (text) =>
	text
		.normalize('NFD')
		.replace(/\p{M}/gu, '')
		.toLowerCase()
		.trim();

/**
 * How well a name matches: 2 when it starts with the text, 1 when one of its words does, 0 not at all.
 * @param {string} name
 * @param {string} text folded
 */
export function matchRank(name, text) {
	const folded = fold(name);
	if (folded.startsWith(text)) return 2;
	return folded.split(/[\s\-–—/,.()&]+/).some((word) => word.startsWith(text)) ? 1 : 0;
}

/**
 * @param {string} input what was typed
 * @param {{
 *   companies: QuickCompany[],
 *   places: [string, number][],
 *   counts: Map<string, number>,
 *   fields?: QuickPage[],
 *   cities?: QuickPage[],
 *   aliases?: Record<string, string>
 * }} sources places: the ones named most in jobs, with how many; counts: open jobs by company;
 *   fields, cities: those with a page; aliases: other names of cities, as slugs ("munchen": "munich")
 * @param {{companies: number, tags: number, places: number, fields?: number, cities?: number}} limits
 * @returns {QuickResults}
 */
export function quickResults(input, { companies, places, counts, fields = [], cities = [], aliases = {} }, limits) {
	const text = fold(input);
	if (text.length < 2) return { fields: [], cities: [], companies: [], tags: [], places: [] };
	/**
	 * @template T
	 * @param {T[]} items @param {(item: T) => string} name @param {(item: T) => number} weight @param {number} limit
	 */
	const best = (items, name, weight, limit) =>
		items
			.map((item) => ({ item, rank: matchRank(name(item), text) }))
			.filter((m) => m.rank)
			.sort((a, b) => b.rank - a.rank || weight(b.item) - weight(a.item))
			.slice(0, limit)
			.map((m) => m.item);
	// A city by its name, its address, or another name of it ("München" finds Munich).
	const typed = slugify(input);
	const aliased = Object.entries(aliases)
		.filter(([alias]) => alias.startsWith(typed))
		.map(([, slug]) => slug);
	const cityRank = (/** @type {QuickPage} */ c) => Math.max(matchRank(c.name, text), aliased.includes(c.slug) ? 1 : 0);
	const foundCities = cities
		.map((item) => ({ item, rank: cityRank(item) }))
		.filter((m) => m.rank)
		.sort((a, b) => b.rank - a.rank || b.item.count - a.item.count)
		.slice(0, limits.cities ?? 2)
		.map((m) => m.item);
	// A place that is a city with a page is offered as that page, once.
	const paged = new Set(foundCities.map((c) => c.slug));
	const other = places.filter(([place]) => !paged.has(slugify(place)));
	// Organizations' tags, with how many have each: a topic (music, open-source, atproto).
	/** @type {Map<string, number>} */
	const tagged = new Map();
	for (const c of companies) for (const tag of c.tags || []) tagged.set(tag, (tagged.get(tag) || 0) + 1);
	return {
		fields: best(fields, (f) => `${f.name} ${f.slug.replace(/-/g, ' ')}`, (f) => f.count, limits.fields ?? 2),
		cities: foundCities,
		companies: best(companies, (c) => c.name, (c) => counts.get(c.key) || 0, limits.companies),
		tags: best([...tagged], ([tag]) => tag, ([, count]) => count, limits.tags),
		places: best(other, ([place]) => place, ([, count]) => count, limits.places).map(([place]) => place)
	};
}
