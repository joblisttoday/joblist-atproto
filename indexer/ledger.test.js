import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dateOffers } from './ledger.js';

const NOW = '2026-11-06T18:00Z';
/** @param {string} t @param {string} [p] @param {string} [c] */
const job = (t, p, c = 'acme.org', l = 'Berlin') => ({ t, u: `https://jobs.example/${t}/${p}`, c, p, l });

test('an offer seen before keeps its first date when its board gives a newer one', () => {
	const jobs = [job('Engineer', '2026-11-06T09:00Z'), job('Designer', '2026-11-06T09:00Z')];
	const { ledger, reposted } = dateOffers(jobs, { 'acme.org\nengineer\nberlin': ['2026-09-01T00:00Z', '2026-11-06T12:00Z'] }, NOW, 30);
	assert.equal(jobs[0].p, '2026-09-01T00:00Z');
	assert.equal(jobs[1].p, '2026-11-06T09:00Z');
	assert.equal(reposted, 1);
	assert.deepEqual(ledger['acme.org\ndesigner\nberlin'], ['2026-11-06T09:00Z', NOW]);
});

test('an offer without a date is dated when first seen, unless its company is new', () => {
	const jobs = [job('Engineer'), job('Support', undefined, 'new.org')];
	const { ledger, dated } = dateOffers(jobs, { 'acme.org\nold\nberlin': ['2026-09-01T00:00Z', NOW] }, NOW, 30);
	assert.equal(jobs[0].p, NOW);
	assert.equal(jobs[1].p, undefined);
	assert.equal(dated, 1);
	// Seen again later: still the day it was first seen, and the new company's offer is now known.
	const later = [job('Engineer'), job('Support', undefined, 'new.org')];
	dateOffers(later, ledger, '2026-11-07T00:00Z', 30);
	assert.equal(later[0].p, NOW);
	assert.equal(later[1].p, undefined);
});

test('the same offer listed twice at a place shares one date, not at another place; posted jobs keep theirs', () => {
	const jobs = [
		job('Engineer', '2026-11-01T00:00Z'),
		job('engineer ', '2026-10-01T00:00Z'),
		job('Engineer', '2026-11-03T00:00Z', 'acme.org', 'Paris'),
		{ ...job('Engineer', '2026-11-05T00:00Z'), s: 'at://x' }
	];
	const { ledger } = dateOffers(jobs, {}, NOW, 30);
	assert.equal(jobs[0].p, '2026-11-01T00:00Z');
	assert.equal(jobs[2].p, '2026-11-03T00:00Z');
	assert.equal(jobs[3].p, '2026-11-05T00:00Z');
	assert.deepEqual(ledger['acme.org\nengineer\nberlin'], ['2026-10-01T00:00Z', NOW]);
});

test('offers not seen are kept for a while, then forgotten', () => {
	const old = { 'acme.org\nrecent\nberlin': ['2026-09-01T00:00Z', '2026-11-01T00:00Z'], 'acme.org\nstale\nberlin': ['2026-01-01T00:00Z', '2026-09-01T00:00Z'] };
	const { ledger } = dateOffers([], old, NOW, 30);
	assert.deepEqual(Object.keys(ledger), ['acme.org\nrecent\nberlin']);
});
