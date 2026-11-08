import { describe, expect, it } from 'vitest';
import { explorerPath, feedPath, fieldsOf, isCompanyKey, isSlug, landingFile, landingPath, pageNumber, pagedPath, searchFeed, slugify } from './landing.js';

describe('landing pages', () => {
	it('makes addresses of place names', () => {
		expect(slugify('São Paulo')).toBe('sao-paulo');
		expect(slugify('  New York City ')).toBe('new-york-city');
		expect(slugify('Saint-Denis')).toBe('saint-denis');
		expect(slugify('東京')).toBe('');
		expect(slugify('x'.repeat(100)).length).toBe(60);
	});

	it('only accepts plain slugs', () => {
		expect(isSlug('berlin')).toBe(true);
		expect(isSlug('new-york')).toBe(true);
		expect(isSlug('Berlin')).toBe(false);
		expect(isSlug('../x')).toBe(false);
		expect(isSlug('a--b')).toBe(false);
		expect(isSlug('-a')).toBe(false);
		expect(isSlug('')).toBe(false);
		expect(isSlug(undefined)).toBe(false);
		expect(isCompanyKey('acme.org')).toBe(true);
		expect(isCompanyKey('../acme')).toBe(false);
		expect(isCompanyKey('acme/org')).toBe(false);
		// A record key given by a generic app (a TID) names no website; older slugs stay.
		expect(isCompanyKey('3mabcxyz2kq2s')).toBe(false);
		expect(isCompanyKey('zalando')).toBe(true);
		expect(isCompanyKey('gruenderszene')).toBe(true);
		expect(isCompanyKey('vertical-aerospace')).toBe(true);
	});

	it('finds the fields of a job by whole words', () => {
		expect(fieldsOf({ t: 'Senior Product Designer' })).toEqual(['design']);
		expect(fieldsOf({ t: 'Backend Engineer', d: 'Data Platform' })).toEqual(['engineering', 'data']);
		expect(fieldsOf({ t: 'Account Executive' })).toEqual(['sales']);
		expect(fieldsOf({ t: 'Ingénieure logiciel' })).toEqual(['engineering']);
		// "ai" is a word, not a part of one.
		expect(fieldsOf({ t: 'Maintainer' })).toEqual([]);
	});

	it('gives each page its address, feed, file and explorer search', () => {
		expect(landingPath({ city: 'berlin' })).toBe('/in/berlin');
		expect(landingPath({ city: 'berlin', field: 'design' })).toBe('/in/berlin/design');
		expect(landingPath({ field: 'design' })).toBe('/field/design');
		expect(feedPath({ city: 'berlin', field: 'design' })).toBe('/feed/in/berlin/design.xml');
		expect(feedPath({})).toBe('/feed/new.xml');
		expect(feedPath({ company: 'acme.org' })).toBe('/feed/company/acme.org.xml');
		expect(feedPath({ search: '?q=design&where=Lisbon' })).toBe('/feed/search.xml?q=design&where=Lisbon');
		expect(landingFile({ field: 'design' })).toBe('landing/field/design.json');
		expect(landingFile({})).toBe('landing/new.json');
		expect(landingFile({ city: 'berlin', page: 2 })).toBe('landing/in/berlin.2.json');
		expect(landingFile({ city: 'berlin', page: 1 })).toBe('landing/in/berlin.json');
	});

	it('numbers the pages of older jobs', () => {
		expect(pagedPath({ city: 'berlin', page: 2 })).toBe('/in/berlin?page=2');
		expect(pagedPath({ field: 'design', page: 1 })).toBe('/field/design');
		expect(pageNumber(null)).toBe(1);
		expect(pageNumber('3')).toBe(3);
		for (const v of ['1', '0', 'x', '02', '-2', '2.5', '999']) expect(pageNumber(v)).toBe(null);
		expect(explorerPath({ cityName: 'São Paulo', field: 'design' })).toBe('/#q=design&where=S%C3%A3o+Paulo');
		expect(explorerPath({})).toBe('/');
	});

	it('finds the feed of a search in a city', () => {
		const index = { generatedAt: '', total: 0, cities: [{ slug: 'berlin', name: 'Berlin', count: 9, fields: ['design'] }], fields: [] };
		const search = { query: '', where: ' berlin ', remote: '' };
		expect(searchFeed(index, search)).toEqual({ city: 'berlin' });
		expect(searchFeed(index, { ...search, query: 'Design' })).toEqual({ city: 'berlin', field: 'design' });
		expect(searchFeed(index, { ...search, query: 'engineer' })).toBe(null);
		expect(searchFeed(index, { ...search, query: 'barista' })).toBe(null);
		expect(searchFeed(index, { ...search, remote: 'remote' })).toBe(null);
		expect(searchFeed(index, { ...search, where: 'Atlantis' })).toBe(null);
		expect(searchFeed(null, search)).toBe(null);
	});
});
