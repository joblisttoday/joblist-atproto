import { describe, expect, it } from 'vitest';
import { signatureHeader, verifySignature } from './stripe.js';

const secret = 'whsec_test';
const body = '{"id":"evt_1"}';
const NOW = Date.parse('2026-10-19T12:00:00Z');

describe('verifySignature', () => {
	it('accepts a body signed with the secret', async () => {
		const header = await signatureHeader({ secret, body, now: NOW });
		expect(await verifySignature({ secret, header, body, now: NOW + 60_000 })).toBe(true);
	});

	it('matches the signature Stripe documents', async () => {
		// HMAC-SHA256 of "1700000000.{}" with "whsec_test", computed with node:crypto
		const v1 = '35495024f4ef3f94e5a93e22221544c4b75e9a42300cd965ab81cb85cd994e91';
		const header = `t=1700000000,v0=ignored,v1=${v1}`;
		expect(await verifySignature({ secret, header, body: '{}', now: 1700000000_000 })).toBe(true);
	});

	it('accepts any of several v1 signatures (while secrets roll)', async () => {
		const header = (await signatureHeader({ secret, body, now: NOW })) + `,v1=${'0'.repeat(64)}`;
		const rolled = `t=${Math.floor(NOW / 1000)},v1=${'0'.repeat(64)},` + header.split(',')[1];
		expect(await verifySignature({ secret, header, body, now: NOW })).toBe(true);
		expect(await verifySignature({ secret, header: rolled, body, now: NOW })).toBe(true);
	});

	it('rejects other secrets, changed bodies, old timestamps and bad headers', async () => {
		const header = await signatureHeader({ secret, body, now: NOW });
		expect(await verifySignature({ secret: 'whsec_other', header, body, now: NOW })).toBe(false);
		expect(await verifySignature({ secret, header, body: body + ' ', now: NOW })).toBe(false);
		expect(await verifySignature({ secret, header, body, now: NOW + 6 * 60_000 })).toBe(false);
		expect(await verifySignature({ secret, header: null, body, now: NOW })).toBe(false);
		expect(await verifySignature({ secret, header: 't=x,v1=zz', body, now: NOW })).toBe(false);
		expect(await verifySignature({ secret: '', header, body, now: NOW })).toBe(false);
	});
});
