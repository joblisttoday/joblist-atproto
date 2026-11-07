import { describe, expect, it } from 'vitest';
import { bare, placeParts } from './place-names.js';
import { expandStates, inPlace } from './place.js';

describe('bare', () => {
	it('takes the work-place words off a place', () => {
		expect(bare('Remote - USA')).toBe('USA');
		expect(bare('United States (Remote)')).toBe('United States');
		expect(bare('US-Remote')).toBe('US');
		expect(bare('Remote job')).toBe('');
		expect(bare(' Hybrid ')).toBe('');
		expect(bare('Paris (On-site)')).toBe('Paris');
		expect(bare('Remote (EMEA)')).toBe('EMEA');
		expect(bare('Remote (United States')).toBe('United States');
		expect(bare('Canada)')).toBe('Canada');
		expect(bare('California (HQ)')).toBe('California (HQ)');
	});
});

describe('expandStates', () => {
	it('writes out US state codes after a comma', () => {
		expect(expandStates('San Francisco, CA')).toBe('San Francisco, California');
		expect(expandStates('Boston, MA, United States')).toBe('Boston, Massachusetts, United States');
		expect(expandStates('Denver, CO - Hybrid')).toBe('Denver, Colorado - Hybrid');
	});
	it('leaves codes of another country alone', () => {
		expect(expandStates('Madrid, MD, Spain')).toBe('Madrid, MD, Spain');
		expect(expandStates('Coimbatore, TN, India')).toBe('Coimbatore, TN, India');
		expect(expandStates('Munich, DE')).toBe('Munich, DE');
		expect(expandStates('Remote in CA')).toBe('Remote in CA');
	});
	it('lets a state find the jobs that use its code', () => {
		expect(inPlace('Austin, TX', 'texas')).toBe(true);
	});
});

describe('placeParts', () => {
	it('names each place once per spelling', () => {
		expect(placeParts('Remote - USA; New York City, NY')).toEqual([
			{ key: 'united states', name: 'USA' },
			{ key: 'new york', name: 'New York City' },
			{ key: 'new york', name: 'New York' }
		]);
		expect(placeParts('Hybrid')).toEqual([]);
	});
});
