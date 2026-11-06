import { describe, expect, test } from 'vitest';
import { focusArea } from './focus.js';

const settings = { cellDeg: 0.5, km: 40, share: 0.5 };

describe('focusArea', () => {
	test('frames the city most jobs are in', () => {
		const berlin = /** @type {[number, number][]} */ ([[13.4, 52.5], [13.3, 52.52], [13.45, 52.48]]);
		const area = focusArea([...berlin, [-74, 40.7]], settings);
		expect(area).toEqual([[13.3, 52.48], [13.45, 52.52]]);
	});
	test('none when the jobs are spread', () => {
		expect(focusArea([[13.4, 52.5], [-74, 40.7], [2.35, 48.85]], settings)).toBe(null);
		expect(focusArea([], settings)).toBe(null);
	});
});
