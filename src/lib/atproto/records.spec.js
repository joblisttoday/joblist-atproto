import { afterEach, describe, expect, it, vi } from 'vitest';
import { listRepos, recordKey } from './records.js';

describe('recordKey', () => {
	const did = 'did:plc:abc';
	const collection = 'today.joblist.company';
	it('reads the key of a record from the repository and collection asked', () => {
		expect(recordKey(`at://${did}/${collection}/acme.org`, did, collection)).toBe('acme.org');
	});
	it('refuses keys that could become another path, and records from elsewhere', () => {
		expect(recordKey(`at://${did}/${collection}/..%2F..%2Fx`, did, collection)).toBe('');
		expect(recordKey(`at://${did}/${collection}/..`, did, collection)).toBe('');
		expect(recordKey(`at://${did}/${collection}/a/b`, did, collection)).toBe('');
		expect(recordKey(`at://did:plc:other/${collection}/acme.org`, did, collection)).toBe('');
		expect(recordKey(`at://${did}/today.joblist.list/acme.org`, did, collection)).toBe('');
	});
});

describe('listRepos', () => {
	afterEach(() => vi.unstubAllGlobals());
	it('asks the next relay when one does not answer', async () => {
		const asked = /** @type {string[]} */ ([]);
		vi.stubGlobal('fetch', async (/** @type {URL} */ url) => {
			asked.push(url.origin);
			if (url.origin === 'https://down.example') return { ok: false, status: 502 };
			return { ok: true, json: async () => ({ repos: [{ did: 'did:plc:a' }] }) };
		});
		expect(await listRepos('today.joblist.company', ['https://down.example', 'https://up.example'])).toEqual(['did:plc:a']);
		expect(asked).toEqual(['https://down.example', 'https://up.example']);
	});
	it('fails when no relay answers', async () => {
		vi.stubGlobal('fetch', async () => ({ ok: false, status: 503 }));
		await expect(listRepos('today.joblist.company', ['https://a.example', 'https://b.example'])).rejects.toThrow('503');
	});
});
