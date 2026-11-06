/**
 * One search box for everything, on every page: what someone types can be a
 * company, a list, a place or words in job titles. Jobs are always one Enter
 * away; the rest is offered as they type.
 *
 * @typedef {{key: string, name: string, tags?: string[]}} QuickCompany
 * @typedef {{uri: string, did: string, rkey: string, name: string, companies: string[]}} QuickList
 * @typedef {{companies: QuickCompany[], lists: QuickList[], places: string[]}} QuickResults
 */

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
 *   lists: QuickList[],
 *   places: [string, number][],
 *   counts: Map<string, number>
 * }} sources places: the ones named most in jobs, with how many; counts: open jobs by company
 * @param {{companies: number, lists: number, places: number}} limits
 * @returns {QuickResults}
 */
export function quickResults(input, { companies, lists, places, counts }, limits) {
	const text = fold(input);
	if (text.length < 2) return { companies: [], lists: [], places: [] };
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
	return {
		companies: best(companies, (c) => c.name, (c) => counts.get(c.key) || 0, limits.companies),
		lists: best(lists, (l) => l.name, (l) => l.companies.length, limits.lists),
		places: best(places, ([place]) => place, ([, count]) => count, limits.places).map(([place]) => place)
	};
}
