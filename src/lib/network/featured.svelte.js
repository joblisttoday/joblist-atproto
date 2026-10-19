import revenue from '#lib/data/revenue.json';
import { featuredId, isActive } from '#lib/models/featured.js';

/**
 * Featured jobs, from the Worker (GET /api/featured). Optional: without
 * the Worker (local development) or when it fails, nothing is featured.
 * @typedef {import('#lib/models/featured.js').Featured} Featured
 * @typedef {import('#lib/models/featured.js').FeatureJob} FeatureJob
 */

/** @type {{items: Featured[]}} */
export const featured = $state({ items: [] });

/** @type {Promise<void> | null} */
let loading = null;

/** Load the featured jobs once per visit. */
export function loadFeatured(fetcher = fetch) {
	loading ??= fetcher(`${revenue.api}/featured`)
		.then((res) => (res.ok ? res.json() : []))
		.then((items) => {
			featured.items = Array.isArray(items) ? items.filter((i) => i?.id && i.job && isActive(i)) : [];
		})
		.catch(() => {
			featured.items = [];
		});
	return loading;
}

/**
 * Tell the Worker which job a payment is for, before paying; the id goes to Stripe.
 * @param {FeatureJob} job
 * @returns {Promise<string>} the job's id
 */
export async function registerIntent(job, fetcher = fetch) {
	const id = await featuredId(job);
	const res = await fetcher(`${revenue.api}/featured/intent`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ id, job })
	});
	if (!res.ok) throw new Error(`${res.status}`);
	return id;
}
