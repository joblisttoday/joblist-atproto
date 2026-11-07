import { describe, expect, it } from 'vitest';
import { explorerPath, feedPath, fieldsOf, isCompanyKey, isSlug, landingFile, landingPath, slugify } from './landing.js';

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
		expect(landingFile({ field: 'design' })).toBe('landing/field/design.json');
		expect(landingFile({})).toBe('landing/new.json');
		expect(explorerPath({ cityName: 'São Paulo', field: 'design' })).toBe('/?q=design&where=S%C3%A3o+Paulo');
		expect(explorerPath({})).toBe('/');
	});
});
