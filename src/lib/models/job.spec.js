import { describe, expect, it } from 'vitest';
import { byCompany, commonPlaces, filterJobs, isRemote, offerPlaces, remoteLimit, sameOffers, tidyPlace, time, workplace } from './job.js';

/** @param {Partial<import('#lib/ats/job.js').Job>} job */
const job = (job) => ({ title: 'Engineer', url: 'https://x', company: 'acme.org', ...job });
const names = new Map([['acme.org', 'Acme']]);
/** @type {import('./job.js').JobFilters} */
const none = { query: '', where: '', remote: '' };

describe('isRemote', () => {
	it('finds remote words in title or location', () => {
		expect(isRemote(job({ location: 'Remote, Germany' }))).toBe(true);
		expect(isRemote(job({ title: 'Designer (Homeoffice)' }))).toBe(true);
		expect(isRemote(job({ location: 'Berlin' }))).toBe(false);
	});
	it('trusts the job board, and ignores remote as a plain title word', () => {
		expect(workplace(job({ location: 'Remote', remote: 'hybrid' }))).toBe('hybrid');
		expect(isRemote(job({ title: 'Remote Sensing Engineer', location: 'Munich' }))).toBe(false);
		expect(isRemote(job({ title: 'Engineer - Remote' }))).toBe(true);
	});
});

describe('remoteLimit', () => {
	it('reads the place a remote job is limited to', () => {
		expect(remoteLimit(job({ location: 'Remote - USA' }))).toBe('united states');
		expect(remoteLimit(job({ location: 'United States | Remote' }))).toBe('united states');
		expect(remoteLimit(job({ location: 'Remote (UK)' }))).toBe('united kingdom');
		expect(remoteLimit(job({ location: 'Berlin', remote: 'remote' }))).toBe('berlin');
	});
	it('is empty when no place is named', () => {
		expect(remoteLimit(job({ location: 'Remote' }))).toBe('');
		expect(remoteLimit(job({ location: 'Remote job' }))).toBe('');
		expect(remoteLimit(job({ location: 'Remote, Global' }))).toBe('');
		expect(remoteLimit(job({ remote: 'remote' }))).toBe('');
	});
});

describe('tidyPlace', () => {
	it('drops the repeated parts of a place', () => {
		expect(tidyPlace('Berlin, Berlin, Germany')).toBe('Berlin, Germany');
		expect(tidyPlace('Paris,  paris, France')).toBe('Paris, France');
		expect(tidyPlace(undefined)).toBe('');
	});
});

describe('filterJobs', () => {
	const jobs = [
		job({ title: 'Designer', location: 'Berlin, Germany', published: '2024-01-01' }),
		job({ title: 'Engineer', location: 'Paris', published: '2024-02-01', url: 'b' }),
		job({ title: 'Engineer', location: 'Remote', url: 'c' })
	];
	it('sorts newest first, undated last', () => {
		expect(filterJobs(jobs, none, names).map((j) => j.location)).toEqual(['Paris', 'Berlin, Germany', 'Remote']);
	});
	it('near someone: newest first among jobs about as close', () => {
		const near = /** @type {[number, number]} */ ([13.405, 52.52]);
		const located = [
			job({ title: 'Old next door', url: 'o', point: [13.406, 52.52], published: '2022-01-01' }),
			job({ title: 'New a bit further', url: 'n', point: [13.41, 52.521], published: '2026-01-01' })
		];
		expect(filterJobs(located, { ...none, near }, names).map((j) => j.title)).toEqual(['New a bit further', 'Old next door']);
	});
	it('near someone: only located jobs, nearest first, within the travel time', () => {
		const located = [
			job({ title: 'Far', location: 'Potsdam', url: 'p', point: [13.0645, 52.3906] }),
			job({ title: 'Close', location: 'Berlin', url: 'b', point: [13.41, 52.52] }),
			job({ title: 'Nowhere', location: 'Remote', url: 'r' })
		];
		const near = /** @type {[number, number]} */ ([13.405, 52.52]);
		const found = filterJobs(located, { ...none, near }, names);
		expect(found.map((j) => j.title)).toEqual(['Close', 'Far']);
		expect(found[0].km).toBeLessThan(1);
		expect(filterJobs(located, { ...none, near, within: 30 }, names).map((j) => j.title)).toEqual(['Close']);
	});
	it('filters by words, place and remote', () => {
		expect(filterJobs(jobs, { ...none, query: 'acme engineer' }, names)).toHaveLength(2);
		expect(filterJobs(jobs, { ...none, where: 'berlin' }, names)).toHaveLength(1);
		expect(filterJobs(jobs, { ...none, remote: 'remote' }, names)).toHaveLength(1);
	});
	it('keeps remote jobs open to the place, or to anywhere', () => {
		const remote = [
			job({ location: 'Remote - USA', url: 'us' }),
			job({ location: 'Remote (EMEA)', url: 'emea' }),
			job({ location: 'Remote', url: 'any' }),
			job({ location: 'Austin, TX', url: 'austin' })
		];
		const urls = (/** @type {Partial<import('./job.js').JobFilters>} */ f) => filterJobs(remote, { ...none, ...f }, names).map((j) => j.url);
		expect(urls({ remote: 'remote', where: 'germany' })).toEqual(['emea', 'any']);
		expect(urls({ remote: 'remote', where: 'us' })).toEqual(['us', 'any']);
		expect(urls({ remote: 'anywhere' })).toEqual(['any']);
		expect(urls({ where: 'us' })).toEqual(['us']);
	});
});

describe('byCompany', () => {
	it('groups, biggest first', () => {
		const groups = byCompany([job({ company: 'a' }), job({ company: 'b' }), job({ company: 'b' })]);
		expect(groups.map(([key, list]) => [key, list.length])).toEqual([['b', 2], ['a', 1]]);
	});
});

describe('commonPlaces', () => {
	it('counts location parts', () => {
		const jobs = [job({ location: 'Berlin, Germany' }), job({ location: 'Berlin' }), job({ location: 'Paris' })];
		expect(commonPlaces(jobs, 2)).toEqual(['Berlin', 'Germany']);
	});
});

describe('time', () => {
	it('reads common date formats', () => {
		expect(time('2024-01-01 10:00:00 UTC')).toBe(Date.parse('2024-01-01T10:00:00Z'));
		expect(time('nope')).toBe(0);
		expect(time(undefined)).toBe(0);
	});
});

describe('sameOffers', () => {
	it('keeps one job per company and title, with its other places', () => {
		const jobs = [
			job({ title: 'Engineer', location: 'Sweden', url: '1' }),
			job({ title: 'engineer ', location: 'Nigeria', url: '2' }),
			job({ title: 'Designer', url: '3' }),
			job({ title: 'Engineer', company: 'other.org', url: '4' })
		];
		const merged = sameOffers(jobs);
		expect(merged.map((j) => j.url)).toEqual(['1', '3', '4']);
		expect(offerPlaces(merged[0])).toEqual(['Sweden', 'Nigeria']);
		expect(jobs[0].also).toBeUndefined();
	});
});
