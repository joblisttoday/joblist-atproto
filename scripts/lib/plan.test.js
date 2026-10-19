import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { planWrites } from './plan.js';

const BOT = 'did:bot';
const now = '2026-10-19T00:00:00Z';
const ctx = { botDid: BOT, bots: [BOT], checkedAt: '2026-10-18T00:00:00Z' };
const caps = { maxWritesPerRun: 2, maxNewCompaniesPerRun: 1 };

/** @param {string} key @param {string} did @param {string} date */
const version = (key, did, date) => ({ did, rkey: key, uri: `at://${did}/today.joblist.company/${key}`, value: { name: key, createdAt: date } });

const versionsByKey = new Map([
	['a.org', [version('a.org', 'did:h', '2026-01-01')]],
	['b.org', [version('b.org', 'did:h', '2026-10-18T12:00:00Z')]],
	['c.org', [version('c.org', 'did:h', '2026-01-01'), version('c.org', BOT, '2026-02-01')]],
	['d.org', [version('d.org', 'did:h', '2026-01-01')]]
]);
const change = { url: 'https://new.example' };

describe('planWrites', () => {
	const { writes, skipped } = planWrites({
		repairs: [
			{ key: 'a.org', changes: change, confidence: 'high' },
			{ key: 'b.org', changes: change, confidence: 'high' },
			{ key: 'x.org', changes: change, confidence: 'low' },
			{ key: 'c.org', changes: change, confidence: 'high' },
			{ key: 'd.org', changes: change, confidence: 'high' }
		],
		discoveries: [{ key: 'new.org', value: { name: 'New' }, confidence: 'high', source: 'test' }],
		versionsByKey,
		profiles: new Map(),
		ctx,
		caps,
		now
	});
	it('plans new companies first, so repairs cannot crowd them out', () => {
		assert.deepEqual(writes.map((w) => [w.action, w.rkey, w.kind]), [['create', 'new.org', 'new'], ['create', 'a.org', 'repair']]);
	});
	it('skips human edits after the check, low confidence, and past the cap', () => {
		const reasons = Object.fromEntries(skipped.map((s) => [s.key, s.reason]));
		assert.match(reasons['b.org'], /after the health check/);
		assert.match(reasons['x.org'], /low confidence/);
		assert.match(reasons['c.org'], /cap/);
		assert.match(reasons['d.org'], /cap/);
	});
	it('updates its own version, and puts board repairs before website repairs', () => {
		const result = planWrites({
			repairs: [
				{ key: 'a.org', changes: change, confidence: 'high' },
				{ key: 'c.org', changes: { jobBoard: { provider: 'ashby', id: 'c' } }, confidence: 'high' }
			],
			discoveries: [],
			versionsByKey,
			profiles: new Map(),
			ctx,
			caps: { maxWritesPerRun: 10, maxNewCompaniesPerRun: 0 },
			now
		});
		assert.deepEqual(result.writes.map((w) => [w.action, w.rkey]), [['update', 'c.org'], ['create', 'a.org']]);
	});
	it('never deletes', () => {
		assert.ok(writes.every((w) => w.action !== /** @type {any} */ ('delete')));
	});
	it('adds new companies only for unknown keys, within their own cap', () => {
		const result = planWrites({
			repairs: [],
			discoveries: [
				{ key: 'a.org', value: { name: 'A' }, confidence: 'high', source: 'test' },
				{ key: 'n1.org', value: { name: 'N1' }, confidence: 'high', source: 'test' },
				{ key: 'n2.org', value: { name: 'N2' }, confidence: 'high', source: 'test' }
			],
			versionsByKey,
			profiles: new Map(),
			ctx,
			caps: { maxWritesPerRun: 10, maxNewCompaniesPerRun: 1 },
			now
		});
		assert.deepEqual(result.writes.map((w) => w.rkey), ['n1.org']);
		assert.equal(result.writes[0].value.updatedAt, now);
	});
});
