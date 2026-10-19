import { beforeEach, describe, expect, it } from 'vitest';
import revenue from '../lib/data/revenue.json' with { type: 'json' };
import { featuredId, recordJob } from '../lib/models/featured.js';
import worker from './index.js';
import { memoryKv } from './memory-kv.js';
import { signatureHeader } from './stripe.js';

const SECRET = 'whsec_test';
const BASE = 'https://atproto.joblist.today';
const JOB = recordJob('did:plc:abc', '3abc');
const DAY = 24 * 3600 * 1000;

/** @type {ReturnType<typeof memoryKv>} */
let kv;
/** @type {import('./index.js').Env} */
let env;
beforeEach(() => {
	kv = memoryKv();
	env = { FEATURED: kv, STRIPE_WEBHOOK_SECRET: SECRET };
});

/** @param {string} path @param {RequestInit} [init] */
const call = (path, init) => worker.fetch(new Request(BASE + path, init), env);

/** @param {unknown} body */
const intent = (body) => call('/api/featured/intent', { method: 'POST', body: JSON.stringify(body) });

/** @param {Record<string, any>} session @param {string} [type] */
async function webhook(session, type = 'checkout.session.completed') {
	const body = JSON.stringify({ id: 'evt_1', type, data: { object: session } });
	const headers = { 'stripe-signature': await signatureHeader({ secret: SECRET, body }) };
	return call('/api/stripe/webhook', { method: 'POST', body, headers });
}

/** A paid Checkout Session for the featuring price. */
const paid = (/** @type {string} */ id, extra = {}) => ({
	id: 'cs_test_1',
	client_reference_id: id,
	payment_status: 'paid',
	currency: revenue.currency.toLowerCase(),
	amount_total: revenue.featured.price * 100,
	customer_details: { email: 'someone@example.org', name: 'Someone', address: { city: 'Berlin' } },
	...extra
});

describe('GET /api/featured', () => {
	it('lists nothing at first, cached for a minute', async () => {
		const res = await call('/api/featured');
		expect(await res.json()).toEqual([]);
		expect(res.headers.get('cache-control')).toBe(`public, max-age=${revenue.featured.cacheSeconds}`);
	});

	it('lists nothing without KV', async () => {
		env = {};
		expect(await (await call('/api/featured')).json()).toEqual([]);
	});
});

describe('POST /api/featured/intent', () => {
	it('stores the job for its id, for two days', async () => {
		const id = await featuredId(JOB);
		const res = await intent({ id, job: JOB });
		expect(res.status).toBe(200);
		const entry = kv.data.get(`intent:${id}`);
		expect(JSON.parse(entry?.value || '')).toEqual(JOB);
		expect((entry?.expires || 0) - Date.now()).toBeGreaterThan(revenue.featured.intentDays * DAY - 60_000);
	});

	it('refuses an id that is not the job\'s hash, or no job', async () => {
		expect((await intent({ id: 'made-up', job: JOB })).status).toBe(400);
		expect((await intent({ id: await featuredId(JOB), job: { kind: 'other' } })).status).toBe(400);
		expect((await call('/api/featured/intent', { method: 'POST', body: 'not json' })).status).toBe(400);
		expect(kv.data.size).toBe(0);
	});
});

describe('POST /api/stripe/webhook', () => {
	it('features a paid job, keeping only its id and dates', async () => {
		const id = await featuredId(JOB);
		await intent({ id, job: JOB });
		const res = await webhook(paid(id));
		expect(await res.json()).toEqual({ result: 'featured' });
		const [item] = await (await call('/api/featured')).json();
		expect(item).toMatchObject({ id, job: JOB });
		expect(Date.parse(item.until) - Date.parse(item.paidAt)).toBe(revenue.featured.days * DAY);
		const stored = [...kv.data.values()].map((e) => e.value).join('\n');
		expect(stored).not.toMatch(/someone|Someone|Berlin|cs_test_1"/);
	});

	it('counts a payment once, even when Stripe sends it twice', async () => {
		const id = await featuredId(JOB);
		await intent({ id, job: JOB });
		await webhook(paid(id));
		expect(await (await webhook(paid(id))).json()).toEqual({ result: 'duplicate' });
	});

	it('extends a job already featured when paid again', async () => {
		const id = await featuredId(JOB);
		await intent({ id, job: JOB });
		await webhook(paid(id));
		kv.data.delete(`intent:${id}`);
		await webhook(paid(id, { id: 'cs_test_2' }));
		const [item] = await (await call('/api/featured')).json();
		expect(Date.parse(item.until) - Date.now()).toBeGreaterThan(2 * revenue.featured.days * DAY - 60_000);
	});

	it('ignores unpaid, underpaid, unknown and other events', async () => {
		const id = await featuredId(JOB);
		await intent({ id, job: JOB });
		expect(await (await webhook(paid(id, { payment_status: 'unpaid' }))).json()).toEqual({ result: 'ignored' });
		expect(await (await webhook(paid(id, { amount_total: 100 }))).json()).toEqual({ result: 'ignored' });
		expect(await (await webhook(paid(id, { currency: 'usd' }))).json()).toEqual({ result: 'ignored' });
		expect(await (await webhook(paid('unknown-id'))).json()).toEqual({ result: 'unknown' });
		expect(await (await webhook(paid(id), 'payment_intent.succeeded')).json()).toEqual({ result: 'ignored' });
		expect(await (await call('/api/featured')).json()).toEqual([]);
	});

	it('features delayed payments once they succeed', async () => {
		const id = await featuredId(JOB);
		await intent({ id, job: JOB });
		const res = await webhook(paid(id), 'checkout.session.async_payment_succeeded');
		expect(await res.json()).toEqual({ result: 'featured' });
	});

	it('rejects unsigned or badly signed events', async () => {
		const body = JSON.stringify({ type: 'checkout.session.completed', data: { object: paid('x') } });
		expect((await call('/api/stripe/webhook', { method: 'POST', body })).status).toBe(400);
		const headers = { 'stripe-signature': await signatureHeader({ secret: 'whsec_other', body }) };
		expect((await call('/api/stripe/webhook', { method: 'POST', body, headers })).status).toBe(400);
	});

	it('is unavailable without its secret, so Stripe retries later', async () => {
		env = { FEATURED: kv };
		expect((await webhook(paid('x'))).status).toBe(503);
	});
});

it('answers 404 elsewhere', async () => {
	expect((await call('/api/other')).status).toBe(404);
	expect((await call('/api/featured', { method: 'DELETE' })).status).toBe(404);
});
