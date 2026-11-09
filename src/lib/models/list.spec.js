import { describe, expect, it } from 'vitest';
import { SHARED, membership, mixedAuthors, sharedList, sharedPath, toList, toRecord } from './list.js';

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

describe('mixedAuthors', () => {
	it('is false when one person made every list', () => {
		expect(mixedAuthors([list({}), list({ name: 'M' })])).toBe(false);
		expect(mixedAuthors([])).toBe(false);
	});
	it('is true when lists come from several people', () => {
		const other = toList({ did: 'did:other', rkey: '2', uri: 'at://did:other/today.joblist.list/2', cid: '', value: { name: 'O', createdAt: '' } });
		expect(mixedAuthors([list({}), other])).toBe(true);
	});
});

describe('a list carried by its link', () => {
	it('goes there and back, its keys joined by "+"', () => {
		const path = sharedPath({ name: 'Places I like', description: 'Near the canal', companies: ['ableton.com', 'gitlab.com'] });
		expect(path).toBe('/lists/shared#name=Places+I+like&about=Near+the+canal&orgs=ableton.com+gitlab.com');
		const list = sharedList(new URLSearchParams(String(path).split('#')[1]));
		expect(list).toMatchObject({ did: SHARED, name: 'Places I like', description: 'Near the canal', companies: ['ableton.com', 'gitlab.com'], open: false });
	});

	it('keeps only what can be a company key, once each', () => {
		const list = sharedList(new URLSearchParams('name=L&orgs=Acme.org+../etc+acme.org+3lksuk2pqx622'));
		expect(list?.companies).toEqual(['acme.org']);
	});

	it('holds no list without a name or a company', () => {
		expect(sharedList(new URLSearchParams('orgs=acme.org'))).toBe(null);
		expect(sharedList(new URLSearchParams('name=L&orgs=../x'))).toBe(null);
	});

	it('has no link past the limit: such a list is published to be shared', () => {
		const companies = Array.from({ length: 301 }, (_, i) => `c${i}.org`);
		expect(sharedPath({ name: 'Big', companies })).toBe(null);
		expect(sharedPath({ name: 'Big', companies: companies.slice(0, 300) })).toMatch(/^\/lists\/shared#/);
	});
});
