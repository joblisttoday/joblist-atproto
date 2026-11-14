import { describe, expect, it } from 'vitest';
import { locationLabel, locationPoints, samePlace, toFoundPlace, toLocation, toLocations, uniquePlaces } from './places.js';

describe('places', () => {
	it('keeps only what a place may say, coordinates only on the Earth', () => {
		expect(toLocation({ name: ' Berlin ', country: 'Germany', countryCode: 'de', latitude: '52.52', longitude: 13.405, extra: 1 })).toEqual({
			name: 'Berlin',
			country: 'Germany',
			countryCode: 'DE',
			latitude: '52.52',
			longitude: '13.405'
		});
		expect(toLocation({ name: 'Nowhere', latitude: '200', longitude: '0' })).toEqual({ name: 'Nowhere' });
		expect(toLocation({ name: '' })).toBeNull();
		expect(toLocations([{ name: 'A' }, null, 'x', { name: 'B' }])).toEqual([{ name: 'A' }, { name: 'B' }]);
	});

	it('names a place in one line, and knows the same one', () => {
		expect(locationLabel({ name: 'Paris', country: 'France' })).toBe('Paris, France');
		expect(samePlace({ name: 'Paris', country: 'France' }, { name: 'paris', country: 'france', latitude: '1' })).toBe(true);
		expect(samePlace({}, {})).toBe(false);
	});

	it('puts on a map only the places that say where they are', () => {
		expect(locationPoints([{ name: 'A', latitude: '1', longitude: '2' }, { name: 'B' }])).toEqual([{ lat: 1, lon: 2, label: 'A' }]);
	});

	it('reads what OpenStreetMap found, each name once', () => {
		const berlin = { properties: { name: 'Berlin', state: 'Berlin', country: 'Germany', countrycode: 'DE' }, geometry: { coordinates: [13.4049539, 52.5170365] } };
		const found = toFoundPlace(berlin);
		expect(found).toEqual({ label: 'Berlin, Germany', location: { name: 'Berlin', country: 'Germany', countryCode: 'DE', latitude: '52.51704', longitude: '13.40495' } });
		expect(uniquePlaces([found, toFoundPlace(berlin), null])).toHaveLength(1);
	});
});
