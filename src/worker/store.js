import revenue from '../lib/data/revenue.json' with { type: 'json' };
import { addPaid, isActive } from '../lib/models/featured.js';

/**
 * What the Worker keeps in KV (namespace FEATURED). Nothing personal:
 * - `intent:<id>`: the job an id stands for, written by the browser before paying (expires after 2 days);
 * - `featured`: the featured jobs, [{id, job, until, paidAt}], public at /api/featured;
 * - `paid:<checkout session id>`: a payment already counted (Stripe may send an event twice), expires.
 *
 * @typedef {import('../lib/models/featured.js').Featured} Featured
 * @typedef {import('../lib/models/featured.js').FeatureJob} FeatureJob
 * @typedef {{
 *   get(key: string, options?: {type?: 'text' | 'json', cacheTtl?: number}): Promise<any>,
 *   put(key: string, value: string, options?: {expirationTtl?: number, expiration?: number}): Promise<void>
 * }} KV
 */

const INDEX = 'featured';
const DAY_SECONDS = 24 * 3600;
// Stripe retries an event for up to 3 days.
const PAID_TTL = 7 * DAY_SECONDS;

/**
 * The featured jobs, also ended ones until the next payment drops them.
 * @param {KV} kv
 * @param {number} [cacheTtl] seconds the edge may keep it
 * @returns {Promise<Featured[]>}
 */
export async function readFeatured(kv, cacheTtl) {
	const items = await kv.get(INDEX, cacheTtl ? { type: 'json', cacheTtl } : { type: 'json' });
	return Array.isArray(items) ? items : [];
}

/**
 * @param {KV} kv
 * @param {number} [now]
 */
export async function activeFeatured(kv, now = Date.now()) {
	const items = await readFeatured(kv, revenue.featured.cacheSeconds);
	return items.filter((item) => isActive(item, now));
}

/**
 * @param {KV} kv
 * @param {string} id
 * @param {FeatureJob} job
 */
export function saveIntent(kv, id, job) {
	return kv.put(`intent:${id}`, JSON.stringify(job), { expirationTtl: revenue.featured.intentDays * DAY_SECONDS });
}

/**
 * The job an id stands for: from the browser's intent, or a job already featured (paid again).
 * @param {KV} kv
 * @param {string} id
 * @returns {Promise<FeatureJob | null>}
 */
async function jobFor(kv, id) {
	const intent = await kv.get(`intent:${id}`, { type: 'json' });
	if (intent) return intent;
	return (await readFeatured(kv)).find((item) => item.id === id)?.job || null;
}

/**
 * Whether a Checkout Session paid at least the price of featuring.
 * @param {any} session
 */
function paysFeaturing(session) {
	return (
		session?.payment_status === 'paid' &&
		session.currency === revenue.currency.toLowerCase() &&
		Number(session.amount_total) >= revenue.featured.price * 100
	);
}

/**
 * Apply a verified Stripe event. Only paid Checkout Sessions for a known
 * job id count; everything else is acknowledged and ignored.
 * @param {KV} kv
 * @param {any} event
 * @param {number} [now]
 * @returns {Promise<'featured' | 'ignored' | 'duplicate' | 'unknown'>}
 */
export async function handleEvent(kv, event, now = Date.now()) {
	if (!['checkout.session.completed', 'checkout.session.async_payment_succeeded'].includes(event?.type)) return 'ignored';
	const session = event.data?.object;
	const id = session?.client_reference_id;
	if (typeof id !== 'string' || !id || !paysFeaturing(session)) return 'ignored';
	if (session.id && (await kv.get(`paid:${session.id}`))) return 'duplicate';
	const job = await jobFor(kv, id);
	if (!job) return 'unknown';
	const items = addPaid(await readFeatured(kv), { id, job }, { now });
	await kv.put(INDEX, JSON.stringify(items));
	if (session.id) await kv.put(`paid:${session.id}`, '1', { expirationTtl: PAID_TTL });
	return 'featured';
}
