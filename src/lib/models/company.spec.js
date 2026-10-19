import { describe, expect, it } from 'vitest';
import { pickVersion, toDomain, toRecord, toForm, boardUrl } from './company.js';

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
	const versions = [version('did:b', '2026-02-01'), version('did:a', '2026-01-01'), version('did:org', '2026-03-01')];
	it('prefers the organization itself', () => {
		const profiles = new Map([['did:org', { handle: 'acme.org' }]]);
		expect(pickVersion(versions, profiles, 'did:b').did).toBe('did:org');
	});
	it('then the viewer, then the oldest', () => {
		expect(pickVersion(versions, new Map(), 'did:b').did).toBe('did:b');
		expect(pickVersion(versions, new Map(), null).did).toBe('did:a');
	});
});

describe('toRecord', () => {
	it('round-trips through the form', () => {
		const form = { ...toForm(null), name: ' Acme ', url: 'acme.org', tags: 'Food, coop', provider: 'lever', boardId: 'acme' };
		const record = toRecord(form, '2026-01-01T00:00:00.000Z');
		expect(record).toMatchObject({ name: 'Acme', url: 'https://acme.org', tags: ['food', 'coop'], jobBoard: { provider: 'lever', id: 'acme' } });
		expect(boardUrl(record.jobBoard)).toBe('https://jobs.lever.co/acme');
	});
});
