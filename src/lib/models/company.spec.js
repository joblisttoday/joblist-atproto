import config from '#lib/data/config.json';
import { describe, expect, it } from 'vitest';
import { boardUrl, changedFields, copyRecord, editedAt, isUnchecked, pickVersion, toCompany, toDomain, toForm, toRecord, uncheckedLabel } from './company.js';

/** @param {string} did @param {string} createdAt */
const version = (did, createdAt) => ({ did, rkey: 'acme.org', uri: `at://${did}/x/acme.org`, cid: '', value: { name: did, createdAt } });

describe('links from records', () => {
	it('keep only web links', () => {
		const bad = { ...version('did:a', '2026-01-01'), value: { name: 'a', createdAt: '2026-01-01', url: 'javascript:alert(1)', links: ['javascript:x', 'https://ok.org'], jobBoard: { url: 'javascript:y' } } };
		const company = toCompany([bad], new Map());
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

describe('pickVersion', () => {
	const versions = [version('did:b', '2026-02-01'), version('did:a', '2026-01-01'), version('did:org', '2026-01-15')];
	it('prefers the organization itself', () => {
		const profiles = new Map([['did:org', { handle: 'acme.org' }]]);
		expect(pickVersion(versions, profiles).did).toBe('did:org');
	});
	it('not when the indexer found its handle is not the domain both ways', () => {
		const profiles = new Map([['did:org', { handle: 'acme.org', verified: false }]]);
		expect(pickVersion(versions, profiles).did).toBe('did:b');
		expect(pickVersion(versions, new Map([['did:org', { handle: 'acme.org', verified: true }]])).did).toBe('did:org');
	});
	it('otherwise shows the most recent edit by anyone', () => {
		expect(pickVersion(versions, new Map()).did).toBe('did:b');
	});
	it('does not believe dates in the future', () => {
		const pinned = { ...version('did:x', '2099-01-01'), value: { name: 'x', createdAt: '2020-01-01', updatedAt: '2099-01-01' } };
		expect(editedAt(pinned)).toBe('');
		expect(pickVersion([pinned, ...versions], new Map()).did).toBe('did:b');
	});
	it('uses updatedAt over createdAt', () => {
		const edited = { ...version('did:a', '2026-01-01'), value: { name: 'a', createdAt: '2026-01-01', updatedAt: '2026-03-01' } };
		expect(editedAt(edited)).toBe('2026-03-01');
		expect(pickVersion([versions[0], edited], new Map()).did).toBe('did:a');
	});
});

describe('own records', () => {
	it('are never labelled as unchecked crawler work', () => {
		const bot = config.bots[0];
		const own = { ...version(bot, '2026-01-01'), rkey: 'acme.org' };
		const company = toCompany([own], new Map([[bot, { handle: 'acme.org' }]]));
		expect(company.verified).toBe(true);
		expect(company.unchecked).toBe(false);
	});
});

describe('isUnchecked', () => {
	const bots = ['did:bot'];
	it('flags a bot version until a person saves a newer one', () => {
		const bot = version('did:bot', '2026-02-01');
		expect(isUnchecked(bot, [bot, version('did:a', '2026-01-01')], bots)).toBe(true);
		expect(isUnchecked(bot, [bot, version('did:a', '2026-03-01')], bots)).toBe(false);
		expect(isUnchecked(version('did:a', '2026-01-01'), [bot], bots)).toBe(false);
	});
	it('is false when there are no bots', () => {
		expect(isUnchecked(version('did:bot', '2026-02-01'), [], [])).toBe(false);
	});
	it('flags a new account over someone else until an established person saves a newer one', () => {
		const fresh = { ...version('did:new', '2026-02-01'), newAuthor: true };
		expect(isUnchecked(fresh, [fresh, version('did:a', '2026-01-01')], bots)).toBe(true);
		expect(uncheckedLabel(fresh, bots)).toBe('company.unchecked.newAccount');
		expect(isUnchecked(fresh, [fresh, { ...version('did:other', '2026-03-01'), newAuthor: true }], bots)).toBe(true);
		expect(isUnchecked(fresh, [fresh, version('did:a', '2026-03-01')], bots)).toBe(false);
	});
});

describe('versions dated by the snapshot', () => {
	it('are ordered by when the indexer first saw them, not the date their author gives', () => {
		const honest = { ...version('did:a', '2026-01-01'), seenAt: '2026-03-01T00:00:00.000Z' };
		const claims = { ...version('did:b', '2026-02-20'), value: { name: 'b', createdAt: '2026-02-20', updatedAt: '2026-04-01' }, seenAt: '2026-02-21T00:00:00.000Z' };
		expect(editedAt(claims)).toBe('2026-02-21T00:00:00.000Z');
		expect(pickVersion([claims, honest], new Map()).did).toBe('did:a');
	});
});

describe('toCompany', () => {
	it('lists versions most recent first and marks the shown one', () => {
		const company = toCompany([version('did:a', '2026-01-01'), version('did:b', '2026-02-01')], new Map());
		expect(company.versions.map((v) => v.did)).toEqual(['did:b', 'did:a']);
		expect(company.record.did).toBe('did:b');
		expect(company.editedAt).toBe('2026-02-01');
	});
});

describe('changedFields', () => {
	it('names the fields that differ', () => {
		const a = version('did:a', '2026-01-01');
		const b = { ...a, value: { ...a.value, name: 'other', tags: ['x'] } };
		expect(changedFields(a, b)).toEqual(['form.name', 'form.tags']);
		expect(changedFields(a, a)).toEqual([]);
	});
});

describe('copyRecord', () => {
	it('keeps the first creation and sets a new edit time', () => {
		const record = copyRecord({ name: 'Acme', createdAt: 'old', updatedAt: 'old' }, '2026-01-01', '2026-05-01');
		expect(record).toMatchObject({ name: 'Acme', createdAt: '2026-01-01', updatedAt: '2026-05-01' });
		expect(copyRecord({ name: 'Acme' }, undefined, 'now').createdAt).toBe('now');
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
		const company = toCompany([{ ...version('did:a', '2026-01-01'), value: { name: 'Acme', createdAt: '2026-01-01', tags: ['coop'], links: ['https://a.org'], jobBoard: { url: 'https://acme.org/jobs' } } }], new Map());
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
