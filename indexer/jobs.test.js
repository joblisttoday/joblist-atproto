import { test } from 'node:test';
import assert from 'node:assert/strict';
import { recordJobs } from './jobs.js';

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
