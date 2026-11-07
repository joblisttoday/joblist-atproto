import { describe, expect, it } from 'vitest';
import { inPlace, prepareLocation } from './place.js';

describe('prepareLocation', () => {
	it('reads a location ahead of time without changing what a search finds', () => {
		expect(inPlace('Berlin, Germany', 'europe')).toBe(true);
		prepareLocation('Remote (EMEA)', true);
		prepareLocation(undefined, false);
		expect(inPlace('Remote (EMEA)', 'germany', true)).toBe(true);
		expect(inPlace('Remote (EMEA)', 'germany', false)).toBe(false);
		expect(inPlace('', 'berlin')).toBe(false);
	});
});
