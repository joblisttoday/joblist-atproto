import { describe, expect, it } from 'vitest';
import { byCompany, commonPlaces, filterJobs, isRemote, time } from './job.js';

/** @param {Partial<import('#lib/ats/job.js').Job>} job */
const job = (job) => ({ title: 'Engineer', url: 'https://x', company: 'acme.org', ...job });
const names = new Map([['acme.org', 'Acme']]);
const none = { query: '', where: '', remote: false };

describe('isRemote', () => {
	it('finds remote words in title or location', () => {
		expect(isRemote(job({ location: 'Remote, Germany' }))).toBe(true);
		expect(isRemote(job({ title: 'Designer (Homeoffice)' }))).toBe(true);
		expect(isRemote(job({ location: 'Berlin' }))).toBe(false);
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
	it('filters by words, place and remote', () => {
		expect(filterJobs(jobs, { ...none, query: 'acme engineer' }, names)).toHaveLength(2);
		expect(filterJobs(jobs, { ...none, where: 'berlin' }, names)).toHaveLength(1);
		expect(filterJobs(jobs, { ...none, remote: true }, names)).toHaveLength(1);
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
