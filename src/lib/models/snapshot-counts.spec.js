import { describe, expect, it } from 'vitest';
import { countJobs, readCounts } from './snapshot-counts.js';
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
	const counts = countJobs(jobs, 10);
	it('counts offers by company, as the pages count them', () => {
		expect(counts.offers).toEqual({ 'acme.org': 2, 'beta.io': 1, 'gamma.com': 1 });
		expect(counts.offers['acme.org']).toBe(offerCount(jobs.slice(0, 3)));
	});
	it('counts the places named most', () => {
		expect(counts.places).toEqual(placeCounts(jobs, 10));
		expect(counts.places[0]).toEqual(['France', 3]);
	});
});

describe('readCounts', () => {
	it('reads the file back as maps', () => {
		const read = readCounts(JSON.parse(JSON.stringify(countJobs(jobs, 2))));
		expect(read?.offers.get('acme.org')).toBe(2);
		expect(read?.places).toEqual([['France', 3], ['Paris', 2]]);
	});
	it('reads nothing from anything else, and keeps only counts', () => {
		expect(readCounts(null)).toBe(null);
		expect(readCounts({ jobs: [] })).toBe(null);
		const read = readCounts({ offers: { a: '3', b: 'x' }, places: [['Paris', 2], 'bad', [3, 1]], here: 'bad' });
		expect([...(read?.offers || [])]).toEqual([['a', 3], ['b', 0]]);
		expect(read?.places).toEqual([['Paris', 2]]);
	});
});
