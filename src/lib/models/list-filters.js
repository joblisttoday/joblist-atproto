import { LOCAL } from './list.js';

/**
 * Finding lists: by words (name, description, author's handle), those with
 * companies hiring now, those anyone can add to, one's own. The most useful
 * first for someone looking for work: most open jobs, then most companies hiring.
 * @typedef {import('./list.js').List} List
 * @typedef {{companies: number, hiring: number, jobs: number}} ListStats
 *   companies: how many it has; hiring: how many of them have jobs open; jobs: their open jobs.
 * @typedef {{query: string, hiring: boolean, open: boolean, mine: boolean}} ListFilters
 */

/**
 * @param {string[]} keys the list's companies (a company added twice counts once)
 * @param {Map<string, number>} counts open jobs by company
 * @returns {ListStats}
 */
export function listStats(keys, counts) {
	const unique = new Set(keys);
	let hiring = 0;
	let jobs = 0;
	for (const key of unique) {
		const count = counts.get(key) || 0;
		if (count) hiring++;
		jobs += count;
	}
	return { companies: unique.size, hiring, jobs };
}

/**
 * @param {List[]} lists
 * @param {ListFilters} filters
 * @param {Map<string, ListStats>} stats by list uri
 * @param {{me?: string | null, handleOf: (did: string) => string}} people who is signed in (theirs: also those on this device), and authors' handles
 * @returns {List[]}
 */
export function findLists(lists, { query, hiring, open, mine }, stats, { me, handleOf }) {
	const words = query.toLowerCase().split(/\s+/).filter(Boolean);
	const of = (/** @type {List} */ l) => stats.get(l.uri) || { companies: 0, hiring: 0, jobs: 0 };
	return lists
		.filter((l) => (!hiring || of(l).hiring) && (!open || l.open) && (!mine || l.did === me || l.did === LOCAL))
		.filter((l) => {
			if (!words.length) return true;
			const text = `${l.name} ${l.description || ''} @${handleOf(l.did)}`.toLowerCase();
			return words.every((w) => text.includes(w));
		})
		.sort(
			(a, b) =>
				of(b).jobs - of(a).jobs ||
				of(b).hiring - of(a).hiring ||
				of(b).companies - of(a).companies ||
				a.name.localeCompare(b.name)
		);
}
