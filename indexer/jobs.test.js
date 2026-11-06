import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recordJobs, tidyJobs } from './jobs.js';

const NOW = Date.parse('2026-10-19T12:00:00Z');
/** @param {string} did @param {string} rkey @param {Record<string, any>} value */
const record = (did, rkey, value) => ({ did, rkey, uri: `at://${did}/today.joblist.job/${rkey}`, cid: '', value });
const base = { title: 'Engineer', company: 'acme.org', url: 'https://acme.org/jobs/1', createdAt: '2026-10-01T00:00:00Z' };
const profiles = new Map([
	['did:plc:acme', { handle: 'acme.org' }],
	['did:plc:bob', { handle: 'bob.bsky.social' }]
]);

test('recordJobs keeps live offers and marks the company own ones', () => {
	const jobs = recordJobs(
		[
			record('did:plc:acme', '1', { ...base, expiresAt: '2026-11-01T00:00:00Z', locations: [{ name: 'Berlin', country: 'Germany' }] }),
			record('did:plc:bob', '2', { ...base, url: 'https://acme.org/jobs/2', expiresAt: '2026-11-01T00:00:00Z', remote: 'remote' }),
			record('did:plc:bob', '3', { ...base, expiresAt: '2026-10-18T00:00:00Z' }),
			record('did:plc:bob', '4', { ...base, title: '', expiresAt: '2026-11-01T00:00:00Z' })
		],
		profiles,
		NOW
	);
	assert.deepEqual(jobs, [
		{ t: 'Engineer', u: 'https://acme.org/jobs/1', c: 'acme.org', l: 'Berlin, Germany', p: base.createdAt, s: 'at://did:plc:acme/today.joblist.job/1', v: 1 },
		{ t: 'Engineer', u: 'https://acme.org/jobs/2', c: 'acme.org', l: 'remote', p: base.createdAt, s: 'at://did:plc:bob/today.joblist.job/2' }
	]);
});

test('tidyJobs: one job per link, in all its cities; no talent pools', () => {
	const job = (/** @type {any} */ o) => ({ t: 'Engineer', u: 'https://a/1', c: 'acme.com', s: 'ats', ...o });
	const { kept, duplicates, dropped } = tidyJobs([
		job({ l: 'Paris' }),
		job({ l: 'Lyon' }),
		job({ l: 'Paris' }),
		job({ c: 'acme', l: 'Lille' }),
		job({ t: 'Join our Talent Pool', u: 'https://a/2' }),
		job({ t: 'Initiativbewerbung (m/w/d)', u: 'https://a/3' }),
		job({ t: 'Designer', u: 'https://b/1', c: 'scale-ai' }),
		job({ t: 'Designer', u: 'https://b/1', c: 'scale.com' })
	]);
	assert.deepEqual(
		kept.map((j) => [j.u, j.c, j.l]),
		[
			['https://a/1', 'acme.com', 'Paris; Lyon'],
			['https://b/1', 'scale.com', undefined]
		]
	);
	assert.deepEqual(duplicates, [['acme.com', 'acme'], ['scale.com', 'scale-ai']]);
	assert.equal(dropped, 2);
});

test('toMinute: dates to the minute, in UTC', async () => {
	const { toMinute } = await import('./jobs.js');
	assert.equal(toMinute('2026-11-02T17:49:54.880+02:00'), '2026-11-02T15:49Z');
	assert.equal(toMinute(undefined), undefined);
	assert.equal(toMinute('not a date'), 'not a date');
});

test('firstJobs: the newest offers, one per company and title, no posted jobs', async () => {
	const { firstJobs } = await import('./jobs.js');
	const job = (/** @type {any} */ o) => ({ t: 'Engineer', u: 'u', c: 'a', ...o });
	const first = firstJobs(
		[job({ p: '2026-11-01T10:00Z' }), job({ p: '2026-11-03T10:00Z' }), job({ t: 'Designer', p: '2026-11-02T10:00Z' }), job({ t: 'Posted', p: '2026-11-04T10:00Z', s: 'at://x' }), job({ t: 'Undated' })],
		5
	);
	assert.deepEqual(first.map((j) => [j.t, j.p]), [['Engineer', '2026-11-03T10:00Z'], ['Designer', '2026-11-02T10:00Z']]);
});
