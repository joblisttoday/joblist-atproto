import { featuredId, toFeatureJob } from '../lib/models/featured.js';
import revenue from '../lib/data/revenue.json' with { type: 'json' };
import { verifySignature } from './stripe.js';
import { activeFeatured, handleEvent, saveIntent } from './store.js';

/**
 * joblist's only server code: featured jobs. Only /api/* reaches it
 * (wrangler.jsonc: assets.run_worker_first); the app is static assets.
 *
 *   GET  /api/featured         the featured jobs now (public, cached)
 *   POST /api/featured/intent  {id, job}: the job a payment will be for
 *   POST /api/stripe/webhook   Stripe events (signed)
 *
 * @typedef {{FEATURED?: import('./store.js').KV, STRIPE_WEBHOOK_SECRET?: string}} Env
 */

const INTENT_MAX_BYTES = 2048;

/**
 * @param {unknown} body
 * @param {number} [status]
 * @param {Record<string, string>} [headers]
 */
function json(body, status = 200, headers = {}) {
	return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } });
}

/** @param {Env} env */
async function getFeatured(env) {
	// Without KV (local development), nothing is featured.
	const items = env.FEATURED ? await activeFeatured(env.FEATURED) : [];
	return json(items, 200, { 'cache-control': `public, max-age=${revenue.featured.cacheSeconds}` });
}

/**
 * @param {Request} request
 * @param {Env} env
 */
async function postIntent(request, env) {
	if (!env.FEATURED) return json({ error: 'unavailable' }, 503);
	const text = await request.text();
	if (text.length > INTENT_MAX_BYTES) return json({ error: 'too large' }, 413);
	/** @type {any} */
	let body;
	try {
		body = JSON.parse(text);
	} catch {
		return json({ error: 'invalid json' }, 400);
	}
	const job = toFeatureJob(body?.job);
	if (!job || typeof body.id !== 'string' || body.id !== (await featuredId(job))) {
		return json({ error: 'invalid job' }, 400);
	}
	await saveIntent(env.FEATURED, body.id, job);
	return json({ id: body.id });
}

/**
 * @param {Request} request
 * @param {Env} env
 */
async function postWebhook(request, env) {
	if (!env.FEATURED || !env.STRIPE_WEBHOOK_SECRET) return json({ error: 'unavailable' }, 503);
	const body = await request.text();
	const header = request.headers.get('stripe-signature');
	if (!(await verifySignature({ secret: env.STRIPE_WEBHOOK_SECRET, header, body }))) {
		return json({ error: 'invalid signature' }, 400);
	}
	/** @type {any} */
	let event;
	try {
		event = JSON.parse(body);
	} catch {
		return json({ error: 'invalid json' }, 400);
	}
	// Acknowledged in every case, so Stripe does not retry events that will never count.
	return json({ result: await handleEvent(env.FEATURED, event) });
}

/** @type {Record<string, (request: Request, env: Env) => Promise<Response>>} */
const routes = {
	'GET /api/featured': (_, env) => getFeatured(env),
	'POST /api/featured/intent': postIntent,
	'POST /api/stripe/webhook': postWebhook
};

export default {
	/**
	 * @param {Request} request
	 * @param {Env} env
	 */
	async fetch(request, env) {
		const route = routes[`${request.method} ${new URL(request.url).pathname}`];
		return route ? route(request, env) : json({ error: 'not found' }, 404);
	}
};
