import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isCompanyHandle, pickAccounts, verifyAccounts } from './accounts.js';

const hosted = ['.bsky.social'];

describe('isCompanyHandle', () => {
	it('takes a registered domain', () => {
		assert.equal(isCompanyHandle('acme.com', hosted), true);
		assert.equal(isCompanyHandle('Acme.co.uk', hosted), true);
	});
	it('not a hosted handle, a subdomain or an invalid one', () => {
		assert.equal(isCompanyHandle('acme.bsky.social', hosted), false);
		assert.equal(isCompanyHandle('kit.bsky.team', hosted), false);
		assert.equal(isCompanyHandle('handle.invalid', hosted), false);
		assert.equal(isCompanyHandle('', hosted), false);
	});
	it('not a domain listed as hosted', () => {
		assert.equal(isCompanyHandle('example.host', ['example.host']), false);
	});
});

describe('pickAccounts', () => {
	const a = (/** @type {string} */ handle, source = 'test') => ({ did: `did:plc:${handle}`, handle, source });
	it('keeps domain accounts once, in order, without known domains, within the cap', () => {
		const { accounts, dropped } = pickAccounts(
			[
				[a('acme.com', 'search'), a('people.bsky.social'), a('known.org')],
				[a('ACME.com', 'followers'), a('beta.io'), a('gamma.dev')]
			],
			{ known: (d) => d === 'known.org', hosted, max: 2 }
		);
		assert.deepEqual(
			accounts.map((x) => [x.handle, x.source]),
			[
				['acme.com', 'search'],
				['beta.io', 'test']
			]
		);
		assert.equal(dropped, 1);
	});
	it('skips an account without a DID', () => {
		assert.equal(pickAccounts([[{ did: '', handle: 'acme.com', source: 'x' }]], { known: () => false, hosted, max: 5 }).accounts.length, 0);
	});
});

describe('verifyAccounts', () => {
	const DID = 'did:plc:acme';
	/** @type {any} */
	const fetcher = async (/** @type {string} */ url) => {
		const answers = /** @type {Record<string, any>} */ ({
			'https://cloudflare-dns.com/dns-query?name=_atproto.acme.com': { Status: 0, Answer: [{ type: 16, data: `"did=${DID}"` }] },
			'https://cloudflare-dns.com/dns-query?name=_atproto.fake.com': { Status: 3 },
			[`https://plc.directory/${DID}`]: { id: DID, alsoKnownAs: ['at://acme.com'] },
			'https://plc.directory/did:plc:fake': { id: 'did:plc:fake', alsoKnownAs: ['at://fake.com'] }
		});
		const key = Object.keys(answers).find((k) => url.startsWith(k));
		return key ? { ok: true, status: 200, json: async () => answers[key], text: async () => '' } : { ok: false, status: 404, text: async () => '' };
	};
	it('keeps only handles checked both ways', async () => {
		const { verified, rejected } = await verifyAccounts(
			[
				{ did: DID, handle: 'acme.com', source: 's' },
				{ did: 'did:plc:fake', handle: 'fake.com', source: 's' }
			],
			2,
			fetcher
		);
		assert.deepEqual(verified.map((x) => x.handle), ['acme.com']);
		assert.deepEqual(rejected, [{ key: 'fake.com', source: 's', reason: 'handle not verified both ways' }]);
	});
});
