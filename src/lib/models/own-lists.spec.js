import { describe, expect, it } from 'vitest';
import { ownLists, recentLists } from './own-lists.js';

/** @param {string} at */
const job = (at) => ({ title: 'Designer', company: 'Acme', url: 'https://jobs.example/1', at });
/** @type {import('./job-collection.js').Collection[]} */
const collections = [
	{ id: 'saved', name: '', at: '', jobs: { a: job('2026-11-01T00:00:00Z') } },
	{ id: 'applied', name: '', at: '', jobs: {} },
	{ id: 'cdream', name: 'Dream jobs', at: '2026-11-02T00:00:00Z', jobs: { b: job('2026-11-05T00:00:00Z'), c: job('2026-11-03T00:00:00Z') } }
];
/** @param {string} did @param {string} rkey @param {string} createdAt */
const list = (did, rkey, createdAt) => ({ uri: `at://${did}/l/${rkey}`, did, rkey, name: rkey, companies: ['a.org', 'b.org'], open: false, hidden: [], createdAt });
const lists = [list('local', 'berlin', '2026-11-04T00:00:00Z'), list('did:plc:me', 'coops', '2026-10-01T00:00:00Z')];
const rows = ownLists(collections, lists, (l) => `/${l.did}/${l.rkey}`, (l) => l.did !== 'local');

describe('own lists', () => {
	it('lists the lists of jobs first, private, then the lists of organizations, each saying whether it is public', () => {
		expect(rows.map((r) => [r.href, r.kind, r.count, r.public, r.builtin])).toEqual([
			['/me/lists/saved', 'jobs', 1, false, true],
			['/me/lists/applied', 'jobs', 0, false, true],
			['/me/lists/cdream', 'jobs', 2, false, false],
			['/local/berlin', 'organizations', 2, false, false],
			['/did:plc:me/coops', 'organizations', 2, true, false]
		]);
	});

	it('shows at a glance the few with something in them, the latest changed first', () => {
		expect(recentLists(rows, 3).map((r) => r.href)).toEqual(['/me/lists/cdream', '/local/berlin', '/me/lists/saved']);
	});
});
