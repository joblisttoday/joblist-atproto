import { describe, expect, it } from 'vitest';
import { fieldsOf, isCompanyKey, slugify } from './landing.js';

describe('fields, slugs and keys', () => {
	it('makes addresses of place names', () => {
		expect(slugify('São Paulo')).toBe('sao-paulo');
		expect(slugify('  New York City ')).toBe('new-york-city');
		expect(slugify('Saint-Denis')).toBe('saint-denis');
		expect(slugify('東京')).toBe('');
		expect(slugify('x'.repeat(100)).length).toBe(60);
	});

	it('only accepts plain company keys', () => {
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
});
