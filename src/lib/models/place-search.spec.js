import { describe, expect, it } from 'vitest';
import { locationLabel, samePlace, toFoundPlace, uniquePlaces } from './place-search.js';

describe('place search', () => {
	it('keeps a found place as a location, told apart by its region', () => {
		const found = toFoundPlace({
			properties: { name: 'Frankfurt', state: 'Brandenburg', country: 'Germany' },
			geometry: { coordinates: [14.5507, 52.34714211] }
		});
		expect(found).toEqual({
			label: 'Frankfurt, Brandenburg, Germany',
			location: { name: 'Frankfurt', country: 'Germany', latitude: '52.34714', longitude: '14.5507' }
		});
		expect(toFoundPlace({ properties: { name: 'x' }, geometry: {} })).toBe(null);
	});
	it('names and compares locations', () => {
		expect(locationLabel({ name: 'Berlin', country: 'Germany' })).toBe('Berlin, Germany');
		expect(samePlace({ name: 'Berlin', country: 'Germany' }, { name: 'berlin', country: 'Germany', latitude: '1' })).toBe(true);
		expect(samePlace({}, {})).toBe(false);
	});
	it('keeps each found name once', () => {
		const place = (/** @type {string} */ label) => ({ label, location: { name: label } });
		expect(uniquePlaces([place('Paris, France'), null, place('Paris, France'), place('Paris, Texas')]).map((p) => p.label)).toEqual([
			'Paris, France',
			'Paris, Texas'
		]);
	});
});
