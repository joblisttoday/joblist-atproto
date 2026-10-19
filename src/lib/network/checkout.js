import revenue from '#lib/data/revenue.json';
import { checkoutUrl } from '#lib/models/featured.js';
import { registerIntent } from './featured.svelte.js';

const LAST = 'joblist.featured.last';

/**
 * Go to the Payment Link for a job, once the Worker knows which job it is for.
 * The job's page is remembered in this tab, for the thank-you page.
 * @param {import('#lib/models/featured.js').FeatureJob} job
 * @param {string} page the job's page, here or on its job board
 */
export async function checkout(job, page) {
	const id = await registerIntent(job);
	try {
		sessionStorage.setItem(LAST, page);
	} catch {
		// the thank-you page then links to the jobs page
	}
	location.assign(checkoutUrl(revenue.featured.paymentLink, id));
}

/** The page of the job last sent to payment in this tab, if any. */
export function lastCheckout() {
	try {
		return sessionStorage.getItem(LAST) || '';
	} catch {
		return '';
	}
}
