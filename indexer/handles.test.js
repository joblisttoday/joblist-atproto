import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveHandle, verifyCompanyHandles, verifyHandle } from './handles.js';

const DID = 'did:plc:acme';

/**
 * A fetch answering from fixtures, by URL start: a Response-like value, or an Error to throw.
 * @param {Record<string, {status?: number, json?: any, text?: string} | Error>} fixtures
 * @returns {typeof fetch}
 */
const fake = (fixtures) =>
	/** @type {any} */ (
		async (/** @type {string} */ url) => {
			const key = Object.keys(fixtures).find((k) => url.startsWith(k));
			const found = key ? fixtures[key] : { status: 404 };
			if (found instanceof Error) throw found;
			const status = found.status ?? 200;
			return { status, ok: status < 300, json: async () => found.json, text: async () => found.text ?? '' };
		}
	);

const dns = (/** @type {string} */ domain) => `https://cloudflare-dns.com/dns-query?name=_atproto.${domain}`;
const txt = (/** @type {string[]} */ values) => ({ json: { Status: 0, Answer: values.map((v) => ({ type: 16, data: `"${v}"` })) } });
const doc = (/** @type {string[]} */ aka) => ({ json: { id: DID, alsoKnownAs: aka } });

test('a handle named by DNS and by the DID document is verified', async () => {
	const fetcher = fake({ [dns('acme.org')]: txt([`did=${DID}`]), [`https://plc.directory/${DID}`]: doc(['at://acme.org']) });
	assert.equal(await verifyHandle(DID, 'acme.org', fetcher), true);
});

test('the website can name the DID instead of DNS', async () => {
	const fetcher = fake({
		[dns('acme.org')]: { json: { Status: 3 } },
		'https://acme.org/.well-known/atproto-did': { text: `${DID}\n` },
		[`https://plc.directory/${DID}`]: doc(['at://acme.org'])
	});
	assert.equal(await resolveHandle('acme.org', fetcher), DID);
	assert.equal(await verifyHandle(DID, 'acme.org', fetcher), true);
});

test('a domain naming another account, or a document not naming the domain, is not verified', async () => {
	const other = fake({ [dns('acme.org')]: txt(['did=did:plc:someone']), [`https://plc.directory/${DID}`]: doc(['at://acme.org']) });
	assert.equal(await verifyHandle(DID, 'acme.org', other), false);
	const oneWay = fake({ [dns('acme.org')]: txt([`did=${DID}`]), [`https://plc.directory/${DID}`]: doc(['at://acme.bsky.social']) });
	assert.equal(await verifyHandle(DID, 'acme.org', oneWay), false);
	const several = fake({ [dns('acme.org')]: txt([`did=${DID}`, 'did=did:plc:b']), [`https://plc.directory/${DID}`]: doc(['at://acme.org']) });
	assert.equal(await verifyHandle(DID, 'acme.org', several), false);
});

test('what cannot be asked is left unknown', async () => {
	const down = fake({ 'https://cloudflare-dns.com': { status: 503 }, [`https://plc.directory/${DID}`]: doc(['at://acme.org']) });
	assert.equal(await verifyHandle(DID, 'acme.org', down), undefined);
	const plcDown = fake({ [dns('acme.org')]: txt([`did=${DID}`]), 'https://plc.directory': { status: 500 } });
	assert.equal(await verifyHandle(DID, 'acme.org', plcDown), undefined);
});

test('verifyCompanyHandles checks only accounts whose handle is a company they write for', async () => {
	const profiles = new Map([
		[DID, { did: DID, handle: 'acme.org' }],
		['did:plc:fake', { did: 'did:plc:fake', handle: 'evil.org' }],
		['did:plc:bob', { did: 'did:plc:bob', handle: 'bob.bsky.social' }]
	]);
	const fetcher = fake({
		[dns('acme.org')]: txt([`did=${DID}`]),
		[`https://plc.directory/${DID}`]: doc(['at://acme.org']),
		[dns('evil.org')]: txt(['did=did:plc:other']),
		'https://plc.directory/did:plc:fake': { json: { id: 'did:plc:fake', alsoKnownAs: ['at://evil.org'] } }
	});
	const companies = [
		{ did: DID, rkey: 'acme.org', value: {} },
		{ did: 'did:plc:bob', rkey: 'acme.org', value: {} }
	];
	const jobs = [{ did: 'did:plc:fake', value: { company: 'evil.org' } }];
	const result = await verifyCompanyHandles(profiles, companies, jobs, fetcher);
	assert.deepEqual(result, { checked: 2, failed: ['evil.org'], unknown: 0 });
	assert.equal(profiles.get(DID)?.verified, true);
	assert.equal(profiles.get('did:plc:fake')?.verified, false);
	assert.equal(profiles.get('did:plc:bob')?.verified, undefined);
});
