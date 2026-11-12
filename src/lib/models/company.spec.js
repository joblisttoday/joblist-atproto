import { describe, expect, it } from 'vitest';
import { boardUrl, countingVersions, editedAt, mayDescribe, ownDomain, pickVersion, toCompany, toDomain, toForm, toRecord } from './company.js';

/** @param {string} did @param {string} createdAt */
const version = (did, createdAt) => ({ did, rkey: 'acme.org', uri: `at://${did}/x/acme.org`, cid: '', value: { name: did, createdAt } });
/** Profiles in which this account is acme.org itself. @param {string} did */
const ownBy = (did) => new Map([[did, { handle: 'acme.org' }]]);

describe('links from records', () => {
	it('keep only web links', () => {
		const bad = { ...version('did:a', '2026-01-01'), value: { name: 'a', createdAt: '2026-01-01', url: 'javascript:alert(1)', links: ['javascript:x', 'https://ok.org'], jobBoard: { url: 'javascript:y' } } };
		const company = toCompany([bad], ownBy('did:a'));
		expect(company.url).toBeUndefined();
		expect(company.links).toEqual(['https://ok.org']);
		expect(boardUrl(company.jobBoard)).toBe('');
	});
});

describe('toDomain', () => {
	it('keeps the bare host', () => {
		expect(toDomain('https://www.Acme.org/jobs?x=1')).toBe('acme.org');
		expect(toDomain('acme.org')).toBe('acme.org');
		expect(toDomain('')).toBe('');
		expect(toDomain(`${'a'.repeat(60)}.`.repeat(5) + 'org')).toBe('');
		expect(toDomain(`${'a'.repeat(60)}.`.repeat(4) + 'org')).toHaveLength(247);
	});
});

describe('an organization is described by itself only', () => {
	const versions = [version('did:b', '2026-02-01'), version('did:a', '2026-01-01'), version('did:org', '2026-01-15')];
	it("counts the organization's own record, and no one else's", () => {
		expect(countingVersions(versions, ownBy('did:org')).map((v) => v.did)).toEqual(['did:org']);
		expect(countingVersions(versions, new Map())).toEqual([]);
		expect(pickVersion(versions, new Map())).toBeUndefined();
	});
	it('not when its handle was found not to be the domain both ways', () => {
		expect(pickVersion(versions, new Map([['did:org', { handle: 'acme.org', verified: false }]]))).toBeUndefined();
	});
	it('its most recent edit, not believing dates in the future', () => {
		const pinned = { ...version('did:org', '2099-01-01'), value: { name: 'x', createdAt: '2020-01-01', updatedAt: '2099-01-01' } };
		expect(editedAt(pinned)).toBe('');
		const edited = { ...version('did:a', '2026-01-01'), value: { name: 'a', createdAt: '2026-01-01', updatedAt: '2026-03-01' } };
		expect(editedAt(edited)).toBe('2026-03-01');
	});
	it('makes a verified company', () => {
		const company = toCompany([version('did:org', '2026-01-15')], ownBy('did:org'));
		expect(company).toMatchObject({ key: 'acme.org', verified: true, editedAt: '2026-01-15' });
		expect(company.versions).toHaveLength(1);
	});
	it('is written by the organization signed in with its domain, no one else', () => {
		expect(mayDescribe({ key: 'acme.org' }, { handle: 'acme.org', did: 'did:plc:x' })).toBe(true);
		expect(mayDescribe({ key: 'acme.org' }, { handle: 'someone.bsky.social', did: 'did:plc:y' })).toBe(false);
		expect(mayDescribe({ key: 'acme.org' }, {})).toBe(false);
	});
	it('a handle on a shared host speaks for no organization', () => {
		expect(ownDomain('acme.org')).toBe('acme.org');
		expect(ownDomain('someone.bsky.social')).toBe('');
		expect(ownDomain(null)).toBe('');
	});
});

describe('toRecord', () => {
	it('round-trips through the form', () => {
		const form = { ...toForm(null), name: ' Acme ', url: 'acme.org', tags: ['Food', 'coop', 'food'], provider: 'lever', boardId: 'acme' };
		const record = toRecord(form, '2026-01-01T00:00:00.000Z', '2026-02-01T00:00:00.000Z');
		expect(record).toMatchObject({ createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-02-01T00:00:00.000Z' });
		expect(record).toMatchObject({ name: 'Acme', url: 'https://acme.org', tags: ['food', 'coop'], jobBoard: { provider: 'lever', id: 'acme' } });
		expect(boardUrl(record.jobBoard)).toBe('https://jobs.lever.co/acme');
	});
	it('keeps tags and links as arrays, links with a scheme and once each', () => {
		const form = { ...toForm(null), name: 'Acme', links: [' bsky.app/profile/acme.org ', '', 'https://bsky.app/profile/acme.org'] };
		const record = toRecord(form, 'now', 'now');
		expect(record.links).toEqual(['https://bsky.app/profile/acme.org']);
		expect(record).not.toHaveProperty('tags');
	});
	it('fills the form from a company and back without loss', () => {
		const company = toCompany([{ ...version('did:a', '2026-01-01'), value: { name: 'Acme', createdAt: '2026-01-01', tags: ['coop'], links: ['https://a.org'], jobBoard: { url: 'https://acme.org/jobs' } } }], ownBy('did:a'));
		const form = toForm(company);
		expect(form).toMatchObject({ tags: ['coop'], links: ['https://a.org'], careersUrl: 'https://acme.org/jobs' });
		expect(toRecord(form, 'c', 'u')).toMatchObject({ tags: ['coop'], links: ['https://a.org'], jobBoard: { url: 'https://acme.org/jobs' } });
	});
});

describe('kind of organization', () => {
	it('is kept when the app knows it, and left out else', async () => {
		const { kindOf, toRecord, toForm } = await import('./company.js');
		expect(kindOf('cooperative')).toBe('cooperative');
		expect(kindOf('<b>')).toBe('');
		const form = { ...toForm(null), name: 'Coop', kind: 'cooperative' };
		expect(toRecord(form, '2026-11-07T00:00:00.000Z', '2026-11-07T00:00:00.000Z').kind).toBe('cooperative');
		expect(toRecord({ ...form, kind: 'bank' }, '2026-11-07T00:00:00.000Z').kind).toBe(undefined);
	});
});

describe('posting on atproto', () => {
	it('says so in the record, with no board to read', () => {
		const form = { ...toForm(null), name: 'joblist', url: 'joblist.today', provider: 'atproto', boardId: 'leftover' };
		expect(toRecord(form, 'x', 'x').jobBoard).toEqual({ provider: 'atproto' });
		expect(boardUrl({ provider: 'atproto' })).toBe('');
	});
});
