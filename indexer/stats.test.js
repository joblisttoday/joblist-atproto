import { test } from 'node:test';
import assert from 'node:assert/strict';
import config from '../src/lib/data/config.json' with { type: 'json' };
import { statsFile, weekOf } from './stats.js';

const places = { berlin: { lat: 52.5, lon: 13.4 } };
const cities = [{ slug: 'berlin', name: 'Berlin', count: 3 }];
const now = '2026-11-12T10:00Z';

test('weeks start on Monday', () => {
	assert.equal(weekOf(Date.parse('2026-11-08T23:00Z')), '2026-11-02');
	assert.equal(weekOf(Date.parse('2026-11-09T00:00Z')), '2026-11-09');
});

test('weeks from when counting started, older ones kept, counts only', () => {
	const ledger = {
		'acme.org\nproduct designer\nberlin': ['2026-11-10T08:00Z', now],
		'acme.org\nsales engineer\nberlin': ['2026-11-03T08:00Z', '2026-11-04T08:00Z'],
		'acme.org\nold role\nberlin': ['2025-01-01T00:00Z', now]
	};
	const previous = { since: '2026-10-20T00:00Z', weeks: [{ week: '2026-10-19', new: 7, closed: 1, open: 9, fields: {}, cities: {} }] };
	const jobs = [
		{ t: 'Product Designer', u: 'https://a.example/1', c: 'acme.org', l: 'Berlin', r: 'remote', m: /** @type {[number, number, string, string]} */ ([100000, 120000, 'EUR', 'year']) },
		{ t: 'Old role', u: 'https://a.example/2', c: 'acme.org', l: 'Berlin' }
	];
	const stats = statsFile({ ledger, previous, jobs, places: /** @type {any} */ (places), cities, generatedAt: now });
	assert.equal(stats.since, previous.since);
	assert.deepEqual(stats.weeks.map((w) => w.week), ['2026-10-19', '2026-10-26', '2026-11-02', '2026-11-09']);
	const [, , last, current] = stats.weeks;
	assert.equal(last.new, 1);
	assert.equal(last.closed, 1);
	assert.deepEqual(last.fields, { sales: 1, engineering: 1 });
	assert.equal(current.partial, true);
	assert.equal(current.new, 1);
	assert.equal(current.open, 2);
	assert.deepEqual(stats.now.workplace, { onsite: 0, hybrid: 0, remote: 1, unsaid: 1 });
	assert.equal(stats.now.payShown, 1);
	assert.equal(stats.now.newWeek, 1);
	assert.equal(stats.now.newWeekBefore, 1, 'counting covers the 7 days before');
	assert.equal(stats.now.daysOpen, null, `under ${config.stats.minSample} closed offers: not said`);
	assert.deepEqual(stats.now.cities, [{ slug: 'berlin', name: 'Berlin', open: 3 }]);
	assert.ok(!JSON.stringify(stats).includes('acme'), 'no company named');
});

test('the first run counts from the ledger start, and says nothing of the weeks before', () => {
	const ledger = { 'a.org\ndesigner\nberlin': ['2026-10-01T00:00Z', now], 'a.org\nclerk\nberlin': ['2026-10-01T00:00Z', '2026-11-11T09:00Z'] };
	const stats = statsFile({ ledger, previous: null, jobs: [], places: /** @type {any} */ (places), cities, generatedAt: now });
	assert.equal(stats.since, '2026-11-11T09:00Z');
	assert.deepEqual(stats.weeks.map((w) => w.week), ['2026-11-09']);
	assert.equal(stats.now.newWeekBefore, null);
});
