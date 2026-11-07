import { describe, expect, it } from 'vitest';
import { isRemote } from './job.js';
import {
	claimedCompanies,
	daysLeft,
	expiryDate,
	isLive,
	mergeJobs,
	notFromCompany,
	postedFirst,
	renewed,
	toApplyUrl,
	toForm,
	toJob,
	toPost,
	toRecord,
	withPoints
} from './job-post.js';

const NOW = Date.parse('2026-10-19T12:00:00Z');
const DAY = 24 * 3600 * 1000;
const PAGE = 'https://joblist.today/job/did%3Aplc%3Aa/3abc';

/** @param {Partial<import('./job-post.js').JobForm>} values */
const form = (values = {}) => ({
	company: 'acme.org',
	title: ' Engineer ',
	description: '',
	locations: [],
	remote: '',
	employment: '',
	offerUrl: '',
	applyTo: '',
	bluesky: false,
	days: 60,
	...values
});

/** @param {Record<string, any>} value @param {string} [did] */
const record = (value, did = 'did:plc:a') => ({ did, rkey: '3abc', uri: `at://${did}/today.joblist.job/3abc`, cid: '', value });

describe('toRecord', () => {
	it('builds a minimal record, linking to its joblist page', () => {
		expect(toRecord(form({ bluesky: true }), { page: PAGE, now: NOW })).toEqual({
			$type: 'today.joblist.job',
			title: 'Engineer',
			company: 'acme.org',
			url: PAGE,
			apply: { bluesky: true },
			createdAt: '2026-10-19T12:00:00.000Z',
			expiresAt: new Date(NOW + 60 * DAY).toISOString()
		});
	});
	it('keeps the offer link, apply email, places, remote and employment', () => {
		const r = toRecord(
			form({
				offerUrl: 'acme.org/jobs/1',
				applyTo: 'jobs@acme.org',
				locations: [{ name: 'Berlin' }, { name: ' ' }],
				remote: 'hybrid',
				employment: 'full-time',
				description: ' Build things. '
			}),
			{ page: PAGE, createdAt: '2026-01-01T00:00:00.000Z', now: NOW }
		);
		expect(r).toMatchObject({
			url: 'https://acme.org/jobs/1',
			apply: { url: 'mailto:jobs@acme.org' },
			locations: [{ name: 'Berlin' }],
			remote: 'hybrid',
			employment: 'full-time',
			description: 'Build things.',
			createdAt: '2026-01-01T00:00:00.000Z'
		});
	});
	it('reads back into the form', () => {
		const r = toRecord(form({ applyTo: 'https://acme.org/apply', offerUrl: '' }), { page: PAGE, now: NOW });
		const post = toPost({ ...record(r), rkey: '3abc' }, new Map());
		expect(toForm(post, '', NOW)).toMatchObject({ offerUrl: '', applyTo: 'https://acme.org/apply', days: 60 });
	});
});

describe('toApplyUrl', () => {
	it('turns emails into mailto and adds https', () => {
		expect(toApplyUrl('a@b.org')).toBe('mailto:a@b.org');
		expect(toApplyUrl('mailto:a@b.org')).toBe('mailto:a@b.org');
		expect(toApplyUrl('b.org/apply')).toBe('https://b.org/apply');
		expect(toApplyUrl(' ')).toBe('');
	});
});

describe('expiry', () => {
	it('defaults to 30 days and caps at 120', () => {
		expect(expiryDate(0, NOW)).toBe(new Date(NOW + 30 * DAY).toISOString());
		expect(expiryDate(500, NOW)).toBe(new Date(NOW + 120 * DAY).toISOString());
		expect(expiryDate(3, NOW)).toBe(new Date(NOW + 3 * DAY).toISOString());
	});
	it('hides expired or incomplete offers', () => {
		const value = { title: 'E', company: 'acme.org', url: 'https://x', expiresAt: new Date(NOW + DAY).toISOString() };
		expect(isLive(value, NOW)).toBe(true);
		expect(isLive(value, NOW + 2 * DAY)).toBe(false);
		expect(isLive({ ...value, expiresAt: 'soon' }, NOW)).toBe(false);
		expect(isLive({ ...value, url: '' }, NOW)).toBe(false);
		expect(isLive({ ...value, expiresAt: '9999-01-01T00:00:00Z' }, NOW)).toBe(false);
		expect(isLive({ ...value, expiresAt: new Date(NOW + 120 * DAY).toISOString() }, NOW)).toBe(true);
	});
	it('renews from now and counts days left', () => {
		const value = renewed({ title: 'E', expiresAt: '2026-01-01T00:00:00Z' }, NOW);
		expect(daysLeft(value.expiresAt, NOW)).toBe(30);
		expect(daysLeft('2026-01-01T00:00:00Z', NOW)).toBe(0);
	});
});

describe('verified and merge', () => {
	const value = { title: 'E', company: 'acme.org', url: 'https://acme.org/jobs/1', createdAt: '2026-10-01', remote: 'remote' };
	const profiles = new Map([
		['did:plc:a', { handle: 'acme.org' }],
		['did:plc:b', { handle: 'bob.bsky.social' }]
	]);
	it('is verified when the poster is the company', () => {
		expect(toPost(record(value, 'did:plc:a'), profiles).verified).toBe(true);
		expect(toPost(record(value, 'did:plc:b'), profiles).verified).toBe(false);
	});
	it('keeps one job per link: the company own post, then board jobs; no shared posts then', () => {
		const shared = toJob(toPost(record(value, 'did:plc:b'), profiles));
		const own = toJob(toPost(record(value, 'did:plc:a'), profiles));
		const other = toJob(toPost(record({ ...value, url: 'https://acme.org/jobs/2' }, 'did:plc:b'), profiles));
		const board = [
			{ title: 'E', url: 'https://acme.org/jobs/1', company: 'acme.org' },
			{ title: 'F', url: 'https://acme.org/jobs/3', company: 'acme.org' }
		];
		const merged = mergeJobs([shared, other, own], board);
		expect(merged.map((j) => [j.url, j.posted?.did])).toEqual([
			['https://acme.org/jobs/1', 'did:plc:a'],
			['https://acme.org/jobs/3', undefined]
		]);
		// Without the company's own post, a shared post never replaces the board's job.
		expect(mergeJobs([shared], board).map((j) => [j.url, j.title, j.posted?.did])).toEqual([
			['https://acme.org/jobs/1', 'E', undefined],
			['https://acme.org/jobs/3', 'F', undefined]
		]);
		expect(postedFirst([board[1], other, own]).map((j) => j.url)).toEqual([
			'https://acme.org/jobs/1',
			'https://acme.org/jobs/2',
			'https://acme.org/jobs/3'
		]);
		expect(isRemote(own)).toBe(true);
	});
});

describe('where posted jobs are', () => {
	const profiles = new Map([['did:plc:a', { handle: 'acme.org' }]]);
	const value = { title: 'E', company: 'acme.org', url: 'https://acme.org/jobs/1', createdAt: '2026-10-01' };
	it('is the place the poster gives, else the one the snapshot found', () => {
		const placed = toJob(toPost(record({ ...value, locations: [{ name: 'Berlin', latitude: '52.5', longitude: '13.4' }] }, 'did:plc:a'), profiles));
		expect(placed.point).toEqual([13.4, 52.5]);
		const named = toJob(toPost(record({ ...value, locations: [{ name: 'Paris' }] }, 'did:plc:a'), profiles));
		expect(named.point).toBeUndefined();
		const uri = `at://did:plc:a/today.joblist.job/${named.posted?.rkey}`;
		/** @type {Map<string, [number, number]>} */
		const points = new Map([[uri, [2.35, 48.86]]]);
		const [found, kept] = withPoints([named, placed], points);
		expect(found.point).toEqual([2.35, 48.86]);
		expect(kept).toBe(placed);
	});
});

describe('pay, status and edits', () => {
	it('keeps a pay range in whole units and reads it back', () => {
		const r = toRecord(form({ salaryMin: '60000.4', salaryMax: '50000', currency: 'eur', period: 'year' }), { page: PAGE, now: NOW });
		expect(r.salary).toEqual({ min: 50000, max: 60000, currency: 'EUR', period: 'year' });
		const post = toPost(record(r), new Map());
		expect(toJob(post).salary).toEqual(r.salary);
		expect(toForm(post, '', NOW)).toMatchObject({ salaryMin: '50000', salaryMax: '60000', currency: 'EUR', period: 'year' });
	});
	it('leaves out a pay range that says nothing usable', () => {
		expect(toRecord(form({ salaryMin: 'lots', currency: 'EUR', period: 'year' }), { page: PAGE, now: NOW }).salary).toBeUndefined();
		expect(toPost(record({ title: 'E', salary: { min: 1, currency: 'euros', period: 'year' } }), new Map()).salary).toBeUndefined();
	});
	it('says when an edit was made, and a filled offer is no longer live', () => {
		const r = toRecord(form({ status: 'filled' }), { page: PAGE, createdAt: '2026-01-01T00:00:00.000Z', now: NOW });
		expect(r).toMatchObject({ status: 'filled', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: new Date(NOW).toISOString() });
		expect(isLive(r, NOW)).toBe(false);
		expect(isLive({ ...r, status: 'open' }, NOW)).toBe(true);
		expect(toRecord(form({ status: 'open' }), { page: PAGE, now: NOW }).status).toBeUndefined();
	});
});

describe('verified posts', () => {
	it('are from an account whose handle is the company, unless the indexer found otherwise', () => {
		const value = { title: 'E', company: 'acme.org', url: 'https://acme.org/jobs/1' };
		expect(toPost(record(value), new Map([['did:plc:a', { handle: 'acme.org' }]])).verified).toBe(true);
		expect(toPost(record(value), new Map([['did:plc:a', { handle: 'acme.org', verified: false }]])).verified).toBe(false);
		expect(toPost(record(value), new Map([['did:plc:a', { handle: 'other.org' }]])).verified).toBe(false);
	});
});

describe('jobs others post for a company that speaks for itself', () => {
	const own = { title: 'A', url: 'https://acme.org/a', company: 'acme.org', posted: { did: 'did:plc:acme', rkey: '1', verified: true } };
	const fake = { title: 'B', url: 'https://evil.example/b', company: 'acme.org', posted: { did: 'did:plc:x', rkey: '2', verified: false } };
	const board = { title: 'C', url: 'https://jobs.lever.co/acme/c', company: 'acme.org' };
	it('are claimed by its verified version or its own posts', () => {
		const claimed = claimedCompanies([{ key: 'acme.org', verified: false }, { key: 'own.org', verified: true }], [{ company: 'acme.org', verified: true }]);
		expect([...claimed].sort()).toEqual(['acme.org', 'own.org']);
		expect(notFromCompany({ company: 'own.org', verified: false }, claimed)).toBe(true);
		expect(notFromCompany({ company: 'own.org', verified: true }, claimed)).toBe(false);
		expect(notFromCompany({ company: 'free.org', verified: false }, claimed)).toBe(false);
	});
	it('are left out once the company posts its own', () => {
		expect(mergeJobs([own, fake], [board]).map((j) => j.title)).toEqual(['A', 'C']);
		expect(mergeJobs([fake], [board]).map((j) => j.title)).toEqual(['C', 'B']);
	});
});
