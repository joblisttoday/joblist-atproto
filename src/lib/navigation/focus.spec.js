import { describe, expect, it } from 'vitest';
import { nearIndex } from './focus.js';

describe('nearIndex', () => {
	it('keeps the same place when an item follows', () => {
		expect(nearIndex(3, 1)).toBe(1);
	});
	it('goes to the last item when the last one left', () => {
		expect(nearIndex(2, 2)).toBe(1);
	});
	it('finds nothing in an empty list', () => {
		expect(nearIndex(0, 0)).toBe(-1);
	});
});
