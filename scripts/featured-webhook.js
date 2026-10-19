/**
 * Feature a job on a local Worker (`npx wrangler dev`) without Stripe: register
 * the job like the browser does, then send a Checkout Session event signed with
 * the local secret, like Stripe would. Never point it at the deployed site.
 *
 *   STRIPE_WEBHOOK_SECRET=whsec_local_test node scripts/featured-webhook.js http://127.0.0.1:4204 at://did:…/today.joblist.job/…
 *   STRIPE_WEBHOOK_SECRET=whsec_local_test node scripts/featured-webhook.js http://127.0.0.1:4204 example.org https://jobs.example.org/1
 */
import revenue from '../src/lib/data/revenue.json' with { type: 'json' };
import { featuredId, toFeatureJob } from '../src/lib/models/featured.js';
import { signatureHeader } from '../src/worker/stripe.js';

const [base, first, url] = process.argv.slice(2);
const secret = process.env.STRIPE_WEBHOOK_SECRET || '';
const job = toFeatureJob(url ? { kind: 'board', company: first, url } : { kind: 'record', uri: first });
if (!base || !job || !secret) {
	console.error('usage: STRIPE_WEBHOOK_SECRET=… node scripts/featured-webhook.js <base> <at-uri | company url>');
	process.exit(1);
}
if (!/^http:\/\/(127\.0\.0\.1|localhost)[:/]/.test(base)) {
	console.error('local Workers only (http://127.0.0.1:…)');
	process.exit(1);
}

const id = await featuredId(job);
const intent = await fetch(`${base}/api/featured/intent`, { method: 'POST', body: JSON.stringify({ id, job }) });
console.log('intent', intent.status, await intent.text());

const session = {
	id: `cs_test_local_${Date.now()}`,
	object: 'checkout.session',
	client_reference_id: id,
	payment_status: 'paid',
	currency: revenue.currency.toLowerCase(),
	amount_total: revenue.featured.price * 100
};
const body = JSON.stringify({ id: `evt_local_${Date.now()}`, type: 'checkout.session.completed', data: { object: session } });
const headers = { 'content-type': 'application/json', 'stripe-signature': await signatureHeader({ secret, body }) };
const res = await fetch(`${base}/api/stripe/webhook`, { method: 'POST', body, headers });
console.log('webhook', res.status, await res.text());
