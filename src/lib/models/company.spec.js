import config from '#lib/data/config.json';
import { describe, expect, it } from 'vitest';
import { boardUrl, changedFields, copyRecord, editedAt, isUnchecked, pickVersion, toCompany, toDomain, toForm, toRecord } from './company.js';

/** @param {string} did @param {string} createdAt */
const version = (did, createdAt) => ({ did, rkey: 'acme.org', uri: `at://${did}/x/acme.org`, cid: '', value: { name: did, createdAt } });

describe('toDomain', () => {
	it('keeps the bare host', () => {
		expect(toDomain('https://www.Acme.org/jobs?x=1')).toBe('acme.org');
		expect(toDomain('acme.org')).toBe('acme.org');
		expect(toDomain('')).toBe('');
	});
});

describe('pickVersion', () => {
	const versions = [version('did:b', '2026-02-01'), version('did:a', '2026-01-01'), version('did:org', '2026-01-15')];
	it('prefers the organization itself', () => {
		const profiles = new Map([['did:org', { handle: 'acme.org' }]]);
		expect(pickVersion(versions, profiles).did).toBe('did:org');
	});
	it('otherwise shows the most recent edit by anyone', () => {
		expect(pickVersion(versions, new Map()).did).toBe('did:b');
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
		const form = { ...toForm(null), name: ' Acme ', url: 'acme.org', tags: 'Food, coop', provider: 'lever', boardId: 'acme' };
		const record = toRecord(form, '2026-01-01T00:00:00.000Z', '2026-02-01T00:00:00.000Z');
		expect(record).toMatchObject({ createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-02-01T00:00:00.000Z' });
		expect(record).toMatchObject({ name: 'Acme', url: 'https://acme.org', tags: ['food', 'coop'], jobBoard: { provider: 'lever', id: 'acme' } });
		expect(boardUrl(record.jobBoard)).toBe('https://jobs.lever.co/acme');
	});
});
