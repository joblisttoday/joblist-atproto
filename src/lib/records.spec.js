import { describe, expect, it } from 'vitest';
import config from '#lib/data/config.json';
import { companyForm, companyRecord, isLive, jobForm, jobPath, jobRecord, newPlaces, safeUrl, toApplyUrl, toJob } from './records.js';
import { domainOf } from './profile.js';

const now = Date.parse('2026-11-12T12:00:00Z');
const DAY = 24 * 3600 * 1000;

describe('links', () => {
	it('follows only web links, and email to apply', () => {
		expect(safeUrl('javascript:alert(1)')).toBe('');
		expect(safeUrl('https://acme.org/jobs')).toBe('https://acme.org/jobs');
		expect(safeUrl('mailto:jobs@acme.org')).toBe('');
		expect(safeUrl('mailto:jobs@acme.org', { email: true })).toBe('mailto:jobs@acme.org');
		expect(toApplyUrl('jobs@acme.org')).toBe('mailto:jobs@acme.org');
		expect(toApplyUrl('acme.org/apply')).toBe('https://acme.org/apply');
	});

	it('takes a domain as typed or pasted', () => {
		expect(domainOf('https://Acme.org/careers?x')).toBe('acme.org');
		expect(domainOf('@acme.coop')).toBe('acme.coop');
		expect(domainOf('not a domain')).toBe('');
	});
});

describe('an organization', () => {
	it('writes over its record: the fields the form does not show are kept', () => {
		const before = { name: 'Acme', createdAt: '2026-01-01T00:00:00Z', locations: [{ name: 'Berlin' }], jobBoard: { provider: 'lever', id: 'acme' } };
		const form = { ...companyForm('acme.org', before), name: ' Acme coop ', tags: 'a, b, a', description: '' };
		const record = companyRecord(form, before, { now });
		expect(record).toMatchObject({ $type: config.collections.company, name: 'Acme coop', url: 'https://acme.org', tags: ['a', 'b'], createdAt: before.createdAt, locations: before.locations, jobBoard: before.jobBoard });
		expect(record).not.toHaveProperty('description');
	});

	it('writes one part alone, the rest as it was; a new one is named after its domain', () => {
		const before = { name: 'Acme', description: 'Gardens', createdAt: '2026-01-01T00:00:00Z' };
		const places = companyRecord({ locations: [{ name: 'Berlin', latitude: '52.5', longitude: '13.4' }, { name: '' }] }, before, { now });
		expect(places).toMatchObject({ name: 'Acme', description: 'Gardens', locations: [{ name: 'Berlin', latitude: '52.5', longitude: '13.4' }] });
		const links = companyRecord({ links: ['bsky.app/profile/acme.org', 'javascript:x', ''] }, null, { domain: 'acme.org', now });
		expect(links).toMatchObject({ name: 'acme.org', links: ['https://bsky.app/profile/acme.org'] });
	});
});

describe('a job offer', () => {
	const where = { company: 'acme.org', did: 'did:plc:acme', rkey: '3abc' };

	it('is its page when it has no other address, runs the days chosen, and is live until then', () => {
		const record = jobRecord({ ...jobForm(null), title: 'Gardener', apply: 'jobs@acme.org', days: 30 }, where, null, now);
		expect(record).toMatchObject({ title: 'Gardener', company: 'acme.org', url: `${config.url}${jobPath(where.did, where.rkey)}`, apply: { url: 'mailto:jobs@acme.org' } });
		expect(Date.parse(record.expiresAt)).toBe(now + 30 * DAY);
		expect(isLive(record, now)).toBe(true);
		expect(isLive(record, now + 31 * DAY)).toBe(false);
		expect(isLive({ ...record, status: 'filled' }, now)).toBe(false);
		// Its page here is not where to apply: its apply link is.
		expect(toJob({ ...record, apply: undefined }).apply).toBe('');
	});

	it('keeps its address, its places and what the form does not show, unless changed', () => {
		const before = { title: 'Gardener', company: 'acme.org', url: 'https://acme.org/jobs/1', locations: [{ name: 'Berlin', country: 'DE' }], salary: { min: 1, currency: 'EUR', period: 'month' }, createdAt: '2026-11-01T00:00:00Z', expiresAt: '2026-11-20T00:00:00Z' };
		const same = jobRecord(jobForm(before, now), where, before, now);
		expect(same).toMatchObject({ url: before.url, locations: before.locations, salary: before.salary, createdAt: before.createdAt });
		const moved = jobRecord({ ...jobForm(before, now), locations: [{ name: 'Paris', latitude: '48.85', longitude: '2.35' }] }, where, before, now);
		expect(moved.locations).toEqual([{ name: 'Paris', latitude: '48.85', longitude: '2.35' }]);
		const remote = jobRecord({ ...jobForm(before, now), remote: 'remote' }, where, before, now);
		expect(remote).not.toHaveProperty('locations');
	});

	it("knows the places it adds to its organization's", () => {
		expect(newPlaces([{ name: 'Berlin', country: 'Germany' }], [{ name: 'berlin', country: 'germany' }, { name: 'Paris' }])).toEqual([{ name: 'Paris' }]);
	});

	it('is never shown further than an offer can run: a date years away is not live', () => {
		expect(isLive({ title: 'x', company: 'a.org', url: 'https://a.org', expiresAt: '2099-01-01T00:00:00Z' }, now)).toBe(false);
	});
});
