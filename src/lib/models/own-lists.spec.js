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
const rows = ownLists(collections);

describe('own lists', () => {
	it('lists the lists of jobs: the built-in ones, then the named ones', () => {
		expect(rows.map((r) => [r.href, r.count, r.builtin])).toEqual([
			['/me/lists/saved', 1, true],
			['/me/lists/applied', 0, true],
			['/me/lists/cdream', 2, false]
		]);
	});

	it('shows at a glance the few with something in them, the latest changed first', () => {
		expect(recentLists(rows, 3).map((r) => r.href)).toEqual(['/me/lists/cdream', '/me/lists/saved']);
	});
});
