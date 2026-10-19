import { describe, expect, it } from 'vitest';
import { isRemote } from './job.js';
import {
	daysLeft,
	expiryDate,
	isLive,
	mergeJobs,
	postedFirst,
	renewed,
	toApplyUrl,
	toForm,
	toJob,
	toPost,
	toRecord
} from './job-post.js';

const NOW = Date.parse('2026-10-19T12:00:00Z');
const DAY = 24 * 3600 * 1000;
const PAGE = 'https://atproto.joblist.today/job/did%3Aplc%3Aa/3abc';

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
	it('defaults to 60 days and caps at 120', () => {
		expect(expiryDate(0, NOW)).toBe(new Date(NOW + 60 * DAY).toISOString());
		expect(expiryDate(500, NOW)).toBe(new Date(NOW + 120 * DAY).toISOString());
		expect(expiryDate(3, NOW)).toBe(new Date(NOW + 3 * DAY).toISOString());
	});
	it('hides expired or incomplete offers', () => {
		const value = { title: 'E', company: 'acme.org', url: 'https://x', expiresAt: new Date(NOW + DAY).toISOString() };
		expect(isLive(value, NOW)).toBe(true);
		expect(isLive(value, NOW + 2 * DAY)).toBe(false);
		expect(isLive({ ...value, expiresAt: 'soon' }, NOW)).toBe(false);
		expect(isLive({ ...value, url: '' }, NOW)).toBe(false);
	});
	it('renews from now and counts days left', () => {
		const value = renewed({ title: 'E', expiresAt: '2026-01-01T00:00:00Z' }, NOW);
		expect(daysLeft(value.expiresAt, NOW)).toBe(60);
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
	it('keeps one job per link, the company own post first, then board jobs', () => {
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
			['https://acme.org/jobs/2', 'did:plc:b'],
			['https://acme.org/jobs/3', undefined]
		]);
		expect(postedFirst([board[1], other, own]).map((j) => j.url)).toEqual([
			'https://acme.org/jobs/1',
			'https://acme.org/jobs/2',
			'https://acme.org/jobs/3'
		]);
		expect(isRemote(own)).toBe(true);
	});
});
