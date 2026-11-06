import { describe, expect, it } from 'vitest';
import { distanceKm, travelMinutes, inArea } from './distance.js';

const berlin = /** @type {[number, number]} */ ([13.405, 52.52]);
const potsdam = /** @type {[number, number]} */ ([13.0645, 52.3906]);

describe('distanceKm', () => {
	it('measures the straight line between two places', () => {
		expect(distanceKm(berlin, potsdam)).toBeCloseTo(27, 0);
	});
	it('is zero at the same place', () => {
		expect(distanceKm(berlin, berlin)).toBe(0);
	});
});

describe('travelMinutes', () => {
	it('estimates the trip at the mode speed, with streets longer than the straight line', () => {
		expect(travelMinutes(10, 'bike')).toBe(52);
		expect(travelMinutes(1, 'walk')).toBe(16);
	});
});

describe('inArea', () => {
	it('a point in an area, also across the date line', () => {
		expect(inArea([13.4, 52.5], [[13, 52], [14, 53]])).toBe(true);
		expect(inArea([2.35, 48.85], [[13, 52], [14, 53]])).toBe(false);
		expect(inArea([179.5, 0], [[170, -10], [-170, 10]])).toBe(true);
		expect(inArea([0, 0], [[170, -10], [-170, 10]])).toBe(false);
	});
});
