import { describe, expect, it } from 'vitest';
import { findCompanies } from './company-filters.js';

/** @param {string} key @param {string} name @param {string[]} [tags] */
const company = (key, name, tags = []) => /** @type {any} */ ({ key, name, tags, locations: [] });
const companies = [company('b.org', 'Beta', ['design']), company('a.org', 'Alpha'), company('c.org', 'Gamma', ['design']), company('d.org', 'Delta')];
const counts = new Map([
	['c.org', 40],
	['b.org', 3]
]);
const none = { query: '', hiring: false, bluesky: false };

describe('findCompanies', () => {
	it('puts the companies hiring most first, then the others by name', () => {
		expect(findCompanies(companies, none, counts, new Set()).map((c) => c.key)).toEqual(['c.org', 'b.org', 'a.org', 'd.org']);
	});
	it('finds by words, by hiring, by being on Bluesky', () => {
		expect(findCompanies(companies, { ...none, query: 'design' }, counts, new Set()).map((c) => c.key)).toEqual(['c.org', 'b.org']);
		expect(findCompanies(companies, { ...none, hiring: true }, counts, new Set()).map((c) => c.key)).toEqual(['c.org', 'b.org']);
		expect(findCompanies(companies, { ...none, bluesky: true }, counts, new Set(['d.org'])).map((c) => c.key)).toEqual(['d.org']);
	});
});
