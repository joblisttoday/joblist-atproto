import { describe, expect, it } from 'vitest';
import { countJobs, placesKey, readCounts } from './snapshot-counts.js';
import { offersIn } from './list-place.js';
import { offerCount, placeCounts } from './job.js';

/** @param {string} company @param {string} title @param {string} location */
const job = (company, title, location) => ({ company, title, location, url: `https://${company}/${title}/${location}`, remote: '' });
const jobs = [
	job('acme.org', 'Engineer', 'Berlin, Germany'),
	job('acme.org', 'Engineer', 'Paris, France'),
	job('acme.org', 'Designer', 'Paris, France'),
	job('beta.io', 'Engineer', 'Lyon, France'),
	job('gamma.com', 'Writer', 'New York, NY')
];

describe('countJobs', () => {
	const counts = countJobs(jobs, [['Paris', 'Lyon'], ['Berlin'], ['Paris', 'Lyon']], 10);
	it('counts offers by company, as the pages count them', () => {
		expect(counts.offers).toEqual({ 'acme.org': 2, 'beta.io': 1, 'gamma.com': 1 });
		expect(counts.offers['acme.org']).toBe(offerCount(jobs.slice(0, 3)));
	});
	it('counts the places named most', () => {
		expect(counts.places).toEqual(placeCounts(jobs, 10));
		expect(counts.places[0]).toEqual(['France', 3]);
	});
	it('counts the offers in each place lists are about, leaving out companies with none', () => {
		expect(Object.keys(counts.here)).toEqual([placesKey(['Paris', 'Lyon']), 'Berlin']);
		expect(counts.here[placesKey(['Paris', 'Lyon'])]).toEqual({ 'acme.org': offersIn(jobs.slice(0, 3), ['Paris', 'Lyon']), 'beta.io': 1 });
		expect(counts.here.Berlin).toEqual({ 'acme.org': 1 });
	});
});

describe('readCounts', () => {
	it('reads the file back as maps', () => {
		const read = readCounts(JSON.parse(JSON.stringify(countJobs(jobs, [['Berlin']], 2))));
		expect(read?.offers.get('acme.org')).toBe(2);
		expect(read?.places).toEqual([['France', 3], ['Paris', 2]]);
		expect(read?.here.get('Berlin')?.get('acme.org')).toBe(1);
	});
	it('reads nothing from anything else, and keeps only counts', () => {
		expect(readCounts(null)).toBe(null);
		expect(readCounts({ jobs: [] })).toBe(null);
		const read = readCounts({ offers: { a: '3', b: 'x' }, places: [['Paris', 2], 'bad', [3, 1]], here: 'bad' });
		expect([...(read?.offers || [])]).toEqual([['a', 3], ['b', 0]]);
		expect(read?.places).toEqual([['Paris', 2]]);
		expect(read?.here.size).toBe(0);
	});
});
