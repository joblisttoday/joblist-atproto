import { searchText } from './company.js';

/**
 * Finding companies: by words (name, domain, tag, place), those hiring now,
 * those on Bluesky. Hiring ones first, most open jobs first: someone looking
 * for work sees who hires; the others after, by name.
 * @typedef {import('./company.js').Company} Company
 * @typedef {{query: string, hiring: boolean, bluesky: boolean}} CompanyFilters
 */

/**
 * @param {Company[]} companies
 * @param {CompanyFilters} filters
 * @param {Map<string, number>} counts open jobs by company
 * @param {{has: (key: string) => boolean}} onBluesky companies whose domain is their Bluesky handle
 * @returns {Company[]}
 */
export function findCompanies(companies, { query, hiring, bluesky }, counts, onBluesky) {
	const words = query.toLowerCase().split(/\s+/).filter(Boolean);
	return companies
		.filter((c) => (!hiring || counts.get(c.key)) && (!bluesky || onBluesky.has(c.key)))
		.filter((c) => {
			if (!words.length) return true;
			const text = searchText(c);
			return words.every((w) => text.includes(w));
		})
		.sort((a, b) => (counts.get(b.key) || 0) - (counts.get(a.key) || 0) || a.name.localeCompare(b.name));
}
