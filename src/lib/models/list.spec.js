import { describe, expect, it } from 'vitest';
import { membership, toList, toRecord } from './list.js';

const LIST = 'at://did:owner/today.joblist.list/1';

/** @param {Record<string, any>} value */
const list = (value) => toList({ did: 'did:owner', rkey: '1', uri: LIST, cid: '', value: { name: 'L', createdAt: '', ...value } });

/** @param {string} did @param {string} company @param {string} createdAt */
const suggestion = (did, company, createdAt, to = LIST) => ({ uri: `at://${did}/s/${company}`, did, rkey: company, list: to, company, createdAt });

describe('membership', () => {
	const suggestions = [
		suggestion('did:b', 'b.org', '2026-02-01'),
		suggestion('did:a', 'b.org', '2026-01-01'),
		suggestion('did:a', 'a.org', '2026-01-01'),
		suggestion('did:a', 'x.org', '2026-01-01'),
		suggestion('did:a', 'other.org', '2026-01-01', 'at://did:z/today.joblist.list/2'),
		suggestion('did:owner', 'self.org', '2026-01-01')
	];

	it('adds suggested companies to open lists, credited to the first to suggest', () => {
		const { members, pending } = membership(list({ open: true, companies: ['a.org'], hidden: ['x.org'] }), suggestions);
		expect(members.map((m) => m.key)).toEqual(['a.org', 'b.org']);
		expect(members[0].suggestion).toBeUndefined();
		expect(members[1].suggestion?.did).toBe('did:a');
		expect(pending).toEqual([]);
	});

	it('keeps suggestions pending for closed lists, without dismissed ones', () => {
		const { members, pending } = membership(list({ companies: ['a.org'], hidden: ['x.org'] }), suggestions);
		expect(members.map((m) => m.key)).toEqual(['a.org']);
		expect(pending.map((s) => s.company)).toEqual(['b.org']);
	});
});

describe('toRecord', () => {
	it('keeps open and hidden only when set', () => {
		expect(toRecord({ name: 'L', description: '', companies: [] }, 'now')).not.toHaveProperty('open');
		const record = toRecord({ name: 'L', description: '', companies: ['a', 'a'], open: true, hidden: ['x', 'x'] }, 'now');
		expect(record).toMatchObject({ companies: ['a'], open: true, hidden: ['x'] });
	});
});
