import { describe, expect, it } from 'vitest';
import { jobTerms, relatedLists } from './list-match.js';

/** @param {string} key @param {string[]} tags @param {string[]} cities @returns {import('./company.js').Company} */
const company = (key, tags, cities = []) =>
	/** @type {any} */ ({ key, name: key, tags, locations: cities.map((name) => ({ name })) });

/** @param {string} rkey @param {string} name @param {string[]} companies @returns {import('./list.js').List} */
const list = (rkey, name, companies = []) => ({
	uri: `at://did:a/today.joblist.list/${rkey}`,
	did: 'did:a',
	rkey,
	name,
	companies,
	open: false,
	hidden: [],
	createdAt: `2026-01-0${rkey}`
});

describe('lists related to a job', () => {
	const companies = new Map([
		['acme.org', company('acme.org', ['design'], ['Berlin'])],
		['b.org', company('b.org', ['Design'])],
		['c.org', company('c.org', ['food'], ['Paris'])]
	]);
	const companyOf = (/** @type {string} */ key) => companies.get(key);
	const membersOf = (/** @type {import('./list.js').List} */ l) => l.companies;

	it('reads the cities and tags, folded, without short words', () => {
		expect([...jobTerms([{ name: 'Köln, Germany' }, { name: 'X' }], companies.get('acme.org'))]).toEqual(['koln', 'berlin', 'design']);
	});

	it('ranks lists naming the city or field, then those sharing companies, without lists that have it', () => {
		const lists = [
			list('1', 'Paris food', ['c.org']),
			list('2', 'Startups', ['b.org']),
			list('3', 'Berlin companies'),
			list('4', 'Berliner Weisse'),
			list('5', 'Design in Berlin', ['acme.org'])
		];
		const terms = jobTerms([{ name: 'Berlin' }], companies.get('acme.org'));
		const found = relatedLists(lists, { company: 'acme.org', terms, membersOf, companyOf });
		expect(found.map((l) => l.rkey)).toEqual(['3', '2']);
	});

	it('finds nothing without terms', () => {
		expect(relatedLists([list('3', 'Berlin')], { company: 'x', terms: new Set(), membersOf, companyOf })).toEqual([]);
	});
});
