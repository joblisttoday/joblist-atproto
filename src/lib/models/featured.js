// Relative imports: this model is shared with the Worker (src/worker/).
import config from '../data/config.json' with { type: 'json' };
import revenue from '../data/revenue.json' with { type: 'json' };

/**
 * Featured jobs: paid by anyone (usually the employer) to be shown in a
 * labelled block above job lists for some days. Featuring never changes
 * which companies a list has, nor the order of anything else.
 *
 * A featured job is only an id, the job it stands for, and dates: no name,
 * no email, nothing about who paid.
 *
 * @typedef {{kind: 'record', uri: string} | {kind: 'board', url: string, company: string}} FeatureJob
 *   record: a today.joblist.job record; board: a job board's job, by its link and company key.
 * @typedef {{id: string, job: FeatureJob, until: string, paidAt: string}} Featured
 */

const DAY = 24 * 3600 * 1000;
const RECORD_URI = new RegExp(`^at://did:[a-z]+:[A-Za-z0-9._:%-]{1,256}/${config.collections.job.replaceAll('.', '\\.')}/[A-Za-z0-9._~:-]{1,512}$`);
const COMPANY_KEY = /^[a-z0-9.-]{1,253}$/;
const URL_MAX = 1000;

/**
 * The job's identity, as text: its record's at-uri, or its company and link.
 * @param {FeatureJob} job
 */
export function jobKey(job) {
	return job.kind === 'record' ? job.uri : `${job.company} ${job.url}`;
}

/**
 * A short id for the job, fit for Stripe's client_reference_id
 * (letters, digits, '-' and '_'): base64url of the SHA-256 of its key.
 * @param {FeatureJob} job
 */
export async function featuredId(job) {
	const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(jobKey(job)));
	const text = btoa(String.fromCharCode(...new Uint8Array(digest)));
	return text.replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

/**
 * The job to feature from untrusted input, or null when it is not one.
 * @param {any} input
 * @returns {FeatureJob | null}
 */
export function toFeatureJob(input) {
	if (input?.kind === 'record' && typeof input.uri === 'string' && RECORD_URI.test(input.uri)) {
		return { kind: 'record', uri: input.uri };
	}
	if (
		input?.kind === 'board' &&
		typeof input.url === 'string' &&
		typeof input.company === 'string' &&
		input.url.length <= URL_MAX &&
		/^https?:\/\/\S+$/i.test(input.url) &&
		COMPANY_KEY.test(input.company)
	) {
		return { kind: 'board', url: input.url, company: input.company };
	}
	return null;
}

/**
 * The job to feature for a posted offer.
 * @param {string} did
 * @param {string} rkey
 * @returns {FeatureJob}
 */
export function recordJob(did, rkey) {
	return { kind: 'record', uri: `at://${did}/${config.collections.job}/${rkey}` };
}

/**
 * @param {Featured} item
 * @param {number} [now]
 */
export function isActive(item, now = Date.now()) {
	return Date.parse(item.until) > now;
}

/**
 * The featured jobs after a payment: the job is featured for `days` more,
 * from now or from when it would have stopped. Ended ones are dropped.
 * @param {Featured[]} items
 * @param {{id: string, job: FeatureJob}} paid
 * @param {{now?: number, days?: number}} [options]
 * @returns {Featured[]}
 */
export function addPaid(items, { id, job }, { now = Date.now(), days = revenue.featured.days } = {}) {
	const active = items.filter((item) => isActive(item, now));
	const current = active.find((item) => item.id === id);
	const from = current ? Math.max(now, Date.parse(current.until)) : now;
	const paidAt = new Date(now).toISOString();
	const item = { id, job, until: new Date(from + days * DAY).toISOString(), paidAt };
	return [...active.filter((i) => i.id !== id), item];
}

/**
 * At most `max` featured jobs, taking turns when there are more: every
 * `rotateMinutes`, the next ones (in order of payment) are shown.
 * @template {{paidAt: string}} T
 * @param {T[]} items
 * @param {{max?: number, now?: number, rotateMinutes?: number}} [options]
 * @returns {T[]}
 */
export function pickFeatured(
	items,
	{ max = revenue.featured.maxPerBlock, now = Date.now(), rotateMinutes = revenue.featured.rotateMinutes } = {}
) {
	const sorted = [...items].sort((a, b) => a.paidAt.localeCompare(b.paidAt));
	if (sorted.length <= max) return sorted;
	const start = Math.floor(now / (rotateMinutes * 60 * 1000)) % sorted.length;
	return Array.from({ length: max }, (_, i) => sorted[(start + i) % sorted.length]);
}

/**
 * Whether a job in a job list is the featured one.
 * @param {FeatureJob} featured
 * @param {import('#lib/ats/job.js').Job} job
 */
export function isJob(featured, job) {
	if (featured.kind === 'record') {
		return Boolean(job.posted) && featured.uri === recordJob(job.posted?.did || '', job.posted?.rkey || '').uri;
	}
	return !job.posted && job.url === featured.url && job.company === featured.company;
}

/**
 * The payment page for a job: the Payment Link, told which job it pays for.
 * @param {string} paymentLink
 * @param {string} id
 */
export function checkoutUrl(paymentLink, id) {
	const url = new URL(paymentLink);
	url.searchParams.set('client_reference_id', id);
	return url.href;
}
