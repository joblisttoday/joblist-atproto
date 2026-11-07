import { describe, expect, it } from 'vitest';
import { listPlace, offersIn } from './list-place.js';

/** @param {string} name */
const place = (name) => listPlace({ name });

describe('listPlace', () => {
	it('reads a city, a country, a region', () => {
		expect(place('Berlin')).toEqual({ name: 'Berlin', places: ['Berlin'] });
		expect(place('Germany')).toEqual({ name: 'Germany', places: ['Germany'] });
		expect(place('  Europe ')).toEqual({ name: 'Europe', places: ['Europe'] });
		expect(place('München')).toEqual({ name: 'München', places: ['München'] });
		expect(place('Cambridge')?.places).toEqual(['Cambridge']);
		expect(place('NYC')).toEqual({ name: 'NYC', places: ['NYC'] });
	});
	it('reads several places', () => {
		expect(place('Paris & Lyon')).toEqual({ name: 'Paris & Lyon', places: ['Paris', 'Lyon'] });
		expect(place('Berlin, Munich and Hamburg')?.places).toEqual(['Berlin', 'Munich', 'Hamburg']);
		expect(place('Paris et Lyon')?.places).toEqual(['Paris', 'Lyon']);
	});
	it('reads the places a name ends with after "in"', () => {
		expect(place('Startups in Berlin')).toEqual({ name: 'Berlin', places: ['Berlin'] });
		expect(place('Jeunes pousses à Paris')).toEqual({ name: 'Paris', places: ['Paris'] });
		expect(place('Robotics in Munich & Zurich')?.places).toEqual(['Munich', 'Zurich']);
	});
	it('finds none when the list is about something else', () => {
		for (const name of ['Building on atproto', 'Remote first', 'Robotics', 'Music for us', 'Open source', 'Food', '', 'Berlin startups', 'Paris & friends', 'Jobs in tech'])
			expect(place(name)).toBe(null);
	});
});

describe('offersIn', () => {
	/** @param {string} title @param {string} location */
	const job = (title, location) => ({ title, location, url: `${title}${location}`, company: 'acme.org' });
	const jobs = [job('Engineer', 'Berlin, Germany'), job('Engineer', 'Portland, OR'), job('Designer', 'Portland, OR'), job('Chef', 'Remote - Germany')];
	it('counts the offers in the places, the same offer in several places once', () => {
		expect(offersIn(jobs, undefined)).toBe(3);
		expect(offersIn(jobs, ['Berlin'])).toBe(2);
		expect(offersIn(jobs, ['Lyon'])).toBe(0);
		expect(offersIn(jobs, ['Berlin'])).toBe(2);
	});
});
