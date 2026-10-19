import { describe, expect, it } from 'vitest';
import {
	addPaid,
	checkoutUrl,
	featuredId,
	isActive,
	isJob,
	jobKey,
	pickFeatured,
	recordJob,
	toFeatureJob
} from './featured.js';

const NOW = Date.parse('2026-10-19T12:00:00Z');
const DAY = 24 * 3600 * 1000;
const RECORD = recordJob('did:plc:abc', '3abc');
/** @type {import('./featured.js').FeatureJob} */
const BOARD = { kind: 'board', url: 'https://jobs.example.org/1', company: 'example.org' };

describe('jobKey and featuredId', () => {
	it('keys records by at-uri, board jobs by company and link', () => {
		expect(jobKey(RECORD)).toBe('at://did:plc:abc/today.joblist.job/3abc');
		expect(jobKey(BOARD)).toBe('example.org https://jobs.example.org/1');
	});

	it('makes a stable id Stripe accepts as client_reference_id', async () => {
		const id = await featuredId(RECORD);
		expect(id).toMatch(/^[A-Za-z0-9_-]{43}$/);
		expect(await featuredId({ ...RECORD })).toBe(id);
		expect(await featuredId(BOARD)).not.toBe(id);
	});
});

describe('toFeatureJob', () => {
	it('accepts records and board jobs, keeping only their identity', () => {
		expect(toFeatureJob({ ...RECORD, email: 'x@y.z' })).toEqual(RECORD);
		expect(toFeatureJob({ ...BOARD, name: 'someone' })).toEqual(BOARD);
	});

	it('rejects anything else', () => {
		expect(toFeatureJob(null)).toBe(null);
		expect(toFeatureJob({ kind: 'record', uri: 'at://did:plc:abc/today.joblist.list/3abc' })).toBe(null);
		expect(toFeatureJob({ kind: 'board', url: 'javascript:alert(1)', company: 'example.org' })).toBe(null);
		expect(toFeatureJob({ kind: 'board', url: 'https://x.org', company: 'Not A Key' })).toBe(null);
		expect(toFeatureJob({ kind: 'board', url: `https://x.org/${'a'.repeat(1000)}`, company: 'x.org' })).toBe(null);
	});
});

describe('addPaid', () => {
	it('features a job for the configured days', () => {
		const [item] = addPaid([], { id: 'a', job: RECORD }, { now: NOW, days: 30 });
		expect(item).toEqual({ id: 'a', job: RECORD, until: new Date(NOW + 30 * DAY).toISOString(), paidAt: new Date(NOW).toISOString() });
		expect(isActive(item, NOW)).toBe(true);
		expect(isActive(item, NOW + 31 * DAY)).toBe(false);
	});

	it('extends a job still featured, and drops ended ones', () => {
		const first = addPaid([], { id: 'a', job: RECORD }, { now: NOW, days: 30 });
		const ended = { id: 'b', job: BOARD, until: new Date(NOW - DAY).toISOString(), paidAt: '2026-01-01T00:00:00Z' };
		const items = addPaid([...first, ended], { id: 'a', job: RECORD }, { now: NOW + 10 * DAY, days: 30 });
		expect(items.map((i) => i.id)).toEqual(['a']);
		expect(items[0].until).toBe(new Date(NOW + 60 * DAY).toISOString());
	});
});

describe('pickFeatured', () => {
	const items = ['a', 'b', 'c', 'd', 'e'].map((id, i) => ({ id, paidAt: `2026-10-0${i + 1}T00:00:00Z` }));

	it('shows all of them when there are few', () => {
		expect(pickFeatured(items.slice(0, 2), { max: 3, now: NOW }).map((i) => i.id)).toEqual(['a', 'b']);
	});

	it('takes turns when there are more', () => {
		const hour = 3600 * 1000;
		const at = (/** @type {number} */ n) => pickFeatured(items, { max: 3, now: n * hour, rotateMinutes: 60 }).map((i) => i.id);
		expect(at(0)).toEqual(['a', 'b', 'c']);
		expect(at(1)).toEqual(['b', 'c', 'd']);
		expect(at(4)).toEqual(['e', 'a', 'b']);
		// over a full turn, every job is shown as often
		/** @type {Record<string, number>} */
		const shown = {};
		for (let n = 0; n < 5; n++) for (const id of at(n)) shown[id] = (shown[id] || 0) + 1;
		expect(Object.values(shown)).toEqual([3, 3, 3, 3, 3]);
	});
});

describe('isJob', () => {
	it('matches posted offers by record, board jobs by link and company', () => {
		const posted = { title: 't', url: 'https://x.org', company: 'x.org', posted: { did: 'did:plc:abc', rkey: '3abc', verified: true } };
		const board = { title: 't', url: BOARD.url, company: BOARD.company };
		expect(isJob(RECORD, posted)).toBe(true);
		expect(isJob(RECORD, board)).toBe(false);
		expect(isJob(BOARD, board)).toBe(true);
		expect(isJob(BOARD, { ...board, company: 'other.org' })).toBe(false);
	});
});

it('passes the id to the Payment Link', () => {
	expect(checkoutUrl('https://buy.stripe.com/test_123', 'abc_-1')).toBe('https://buy.stripe.com/test_123?client_reference_id=abc_-1');
});
