import { describe, expect, it } from 'vitest';
import { byCompany, commonPlaces, filterJobs, isOlder, isRemote, newestFirst, offerPlaces, placeNewest, prepareJob, placeCounts, remoteLimit, sameOffers, spread, tidyPlace, time, workplace } from './job.js';

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
	it('reads hybrid and on site from the location, and a marked hybrid from the title', () => {
		expect(workplace(job({ location: 'Berlin - Hybrid' }))).toBe('hybrid');
		expect(workplace(job({ title: 'Designer (Hybrid)' }))).toBe('hybrid');
		expect(workplace(job({ title: 'Hybrid Cloud Engineer' }))).toBe(undefined);
		expect(workplace(job({ location: 'Paris (On-site)' }))).toBe('onsite');
		expect(workplace(job({ location: 'Paris' }))).toBe(undefined);
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
	it("keeps only the jobs of an organization's team", () => {
		const platform = job({ url: 'https://x/1', title: 'SRE', department: 'Platform' });
		const frontend = job({ url: 'https://x/2', title: 'Frontend developer' });
		expect(filterJobs([platform, frontend], { ...none, team: 'platform' }, names)).toEqual([platform]);
	});
	it('keeps only the jobs of a team across organizations, by the department their boards give', () => {
		const design = job({ url: 'https://x/1', title: 'Product designer' });
		const team = job({ url: 'https://x/2', title: 'Lead', department: 'Design' });
		expect(filterJobs([design, job({ url: 'https://x/3', title: 'Accountant' }), team], { ...none, field: 'design' }, names)).toEqual([team]);
	});
	it('keeps only the jobs that show their pay', () => {
		const paid = job({ url: 'https://x/1', salary: { min: 1, currency: 'EUR', period: 'hour' } });
		expect(filterJobs([paid, job({ url: 'https://x/2' })], { ...none, pay: true }, names)).toEqual([paid]);
	});
	const jobs = [
		job({ title: 'Designer', location: 'Berlin, Germany', published: '2024-01-01' }),
		job({ title: 'Engineer', location: 'Paris', published: '2024-02-01', url: 'b' }),
		job({ title: 'Engineer', location: 'Remote', url: 'c' })
	];
	it('keeps the jobs in any of several places, a remote job limited to their country too', () => {
		const lyon = job({ location: 'Lyon, France', url: 'd' });
		const france = job({ location: 'Remote - France', url: 'e' });
		const found = filterJobs([...jobs, lyon, france], { ...none, places: ['Paris', 'Lyon'] }, names);
		expect(found.map((j) => j.url)).toEqual(['b', 'd', 'e']);
	});
	it('sorts newest first, undated last (once, before filtering)', () => {
		const sorted = [...jobs];
		newestFirst(sorted);
		expect(sorted.map((j) => j.location)).toEqual(['Paris', 'Berlin, Germany', 'Remote']);
	});
	it('keeps the order given, and gives the same jobs when nothing is filtered', () => {
		expect(filterJobs(jobs, none, names)).toBe(jobs);
		const reversed = [...jobs].reverse();
		expect(filterJobs(reversed, { ...none, query: ' ' }, names)).toBe(reversed);
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
	it('counts spellings of a place together, under the most used one', () => {
		const jobs = [
			job({ location: 'San Francisco, CA' }),
			job({ location: 'San Francisco, California' }),
			job({ location: 'Los Angeles, California' }),
			job({ location: 'USA' }),
			job({ location: 'Remote - United States' }),
			job({ location: 'United States' })
		];
		expect(placeCounts(jobs, 3)).toEqual([['California', 3], ['United States', 3], ['San Francisco', 2]]);
	});
	it('leaves out work-place words', () => {
		const jobs = [job({ location: 'Remote' }), job({ location: 'Hybrid' }), job({ location: 'Remote job' }), job({ location: 'On-site, Paris' })];
		expect(commonPlaces(jobs)).toEqual(['Paris']);
	});
});

describe('time', () => {
	it('reads common date formats', () => {
		expect(time('2024-01-01 10:00:00 UTC')).toBe(Date.parse('2024-01-01T10:00:00Z'));
		expect(time('nope')).toBe(0);
		expect(time(undefined)).toBe(0);
	});
});

describe('isOlder', () => {
	const now = Date.parse('2026-11-07T00:00Z');
	it('marks board offers first seen more than the given days ago', () => {
		expect(isOlder(job({ published: '2026-07-01T00:00Z' }), now, 90)).toBe(true);
		expect(isOlder(job({ published: '2026-10-01T00:00Z' }), now, 90)).toBe(false);
	});
	it('never marks undated offers, nor offers posted on joblist (they expire)', () => {
		expect(isOlder(job({}), now, 90)).toBe(false);
		expect(isOlder(job({ published: '2026-01-01T00:00Z', posted: { did: 'did:x', rkey: 'r', verified: false } }), now, 90)).toBe(false);
	});
});

describe('spread', () => {
	/** @param {string} company @param {number} n */
	const job = (company, n) => ({ title: `${company}${n}`, url: `${company}${n}`, company });
	const titles = (/** @type {{title: string}[]} */ jobs) => jobs.map((j) => j.title).join(' ');

	it('lets each company show its first jobs before another one shows more', () => {
		const jobs = [job('a', 1), job('a', 2), job('a', 3), job('a', 4), job('b', 1), job('a', 5), job('c', 1), job('b', 2), job('b', 3)];
		expect(titles(spread(jobs, 2))).toBe('a1 a2 b1 c1 b2 a3 a4 b3 a5');
	});

	it('leaves none out, and keeps the order given with 0', () => {
		const jobs = [job('a', 1), job('a', 2), job('b', 1)];
		expect(spread(jobs, 1)).toHaveLength(3);
		expect(spread(jobs, 0)).toBe(jobs);
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
		// An offer in one place is the job itself, not a copy (tens of thousands of them).
		expect(merged[1]).toBe(jobs[2]);
	});
});

describe('offerCount', () => {
	it('counts offers like sameOffers, without making them', async () => {
		const { offerCount, sameOffers } = await import('./job.js');
		const jobs = /** @type {any[]} */ ([
			{ title: 'Engineer', url: '1', company: 'a' },
			{ title: 'engineer ', url: '2', company: 'a' },
			{ title: 'Engineer', url: '3', company: 'b' },
			{ title: 'Engineer', url: '4', company: 'a', posted: {} }
		]);
		expect(offerCount(jobs)).toBe(sameOffers(jobs).length);
		expect(offerCount(jobs)).toBe(3);
	});
});

describe('placeNewest', () => {
	it('places a few jobs among jobs sorted already, as sorting them all would', () => {
		const sorted = ['2026-11-05', '2026-11-04', '2026-11-02', '2026-11-01', undefined].map((published, i) => job({ url: `s${i}`, published }));
		const others = ['2026-11-03', '2026-11-06', undefined, '2026-11-01'].map((published, i) => job({ url: `o${i}`, published, posted: { did: 'd', rkey: `${i}`, verified: true } }));
		const placed = placeNewest(sorted, others);
		const all = [...sorted, ...others];
		newestFirst(all);
		expect(placed.map((j) => time(j.published))).toEqual(all.map((j) => time(j.published)));
		expect(placed.map((j) => j.url)).toEqual(['o1', 's0', 's1', 'o0', 's2', 's3', 'o3', 's4', 'o2']);
		expect(placeNewest(sorted, [])).toEqual(sorted);
	});
});

describe('prepareJob', () => {
	it('reads a job for searches ahead of time, finding the same', () => {
		const jobs = [job({ title: 'Designer', url: 'p1' }), job({ title: 'Engineer', url: 'p2' })];
		for (const j of jobs) prepareJob(j, names);
		expect(filterJobs(jobs, { ...none, query: 'acme design' }, names).map((j) => j.url)).toEqual(['p1']);
	});
});
