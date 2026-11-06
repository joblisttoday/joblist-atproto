import { safeUrl } from './url.js';
import config from '#lib/data/config.json' with { type: 'json' };

/**
 * Job offers posted as today.joblist.job records, in the poster's own account.
 * Applications never go through joblist: `apply` only says where to send them.
 *
 * @typedef {import('#lib/atproto/records.js').RepoRecord} RepoRecord
 * @typedef {import('#lib/models/company.js').Location} Location
 * @typedef {import('#lib/ats/job.js').Job} Job
 * @typedef {{url?: string, bluesky?: boolean}} Apply
 * @typedef {{
 *   uri: string,
 *   did: string,
 *   rkey: string,
 *   title: string,
 *   company: string,
 *   url: string,
 *   description: string,
 *   locations: Location[],
 *   remote?: string,
 *   employment?: string,
 *   apply: Apply,
 *   createdAt: string,
 *   expiresAt: string,
 *   verified: boolean,
 *   record: RepoRecord
 * }} JobPost
 * @typedef {{
 *   company: string,
 *   title: string,
 *   description: string,
 *   locations: Location[],
 *   remote: string,
 *   employment: string,
 *   offerUrl: string,
 *   applyTo: string,
 *   bluesky: boolean,
 *   days: number
 * }} JobForm
 */

const DAY = 24 * 3600 * 1000;
const { days: DEFAULT_DAYS, maxDays: MAX_DAYS } = config.jobPost;

/**
 * Whether a record is a job offer that can be shown now.
 * @param {Record<string, any> | undefined} value
 * @param {number} [now]
 */
export function isLive(value, now = Date.now()) {
	if (!value?.title || !value.company || !value.url) return false;
	const expires = Date.parse(String(value.expiresAt || ''));
	return Number.isFinite(expires) && expires > now;
}

/**
 * When an offer expires, `days` from now, within the allowed range.
 * @param {number} days
 * @param {number} [now]
 */
export function expiryDate(days, now = Date.now()) {
	const n = Math.min(MAX_DAYS, Math.max(1, Math.round(Number(days) || DEFAULT_DAYS)));
	return new Date(now + n * DAY).toISOString();
}

/**
 * Whole days left before an offer expires (0 when expired).
 * @param {string} expiresAt
 * @param {number} [now]
 */
export function daysLeft(expiresAt, now = Date.now()) {
	const ms = Date.parse(expiresAt) - now;
	return Number.isFinite(ms) && ms > 0 ? Math.ceil(ms / DAY) : 0;
}

/**
 * The same offer, shown again for the default time from now.
 * @param {Record<string, any>} value
 * @param {number} [now]
 */
export function renewed(value, now = Date.now()) {
	return { ...value, expiresAt: expiryDate(DEFAULT_DAYS, now) };
}

/**
 * An application link from what the poster typed: a form (https://…) or an email (mailto:…).
 * @param {string} text
 */
export function toApplyUrl(text) {
	const value = (text || '').trim();
	if (!value) return '';
	if (/^mailto:/i.test(value)) return value;
	if (/^[^\s@/:]+@[^\s@/]+\.[^\s@/]+$/.test(value)) return `mailto:${value}`;
	return withScheme(value);
}

/** @param {Apply | undefined} apply */
export function canApply(apply) {
	return Boolean(apply?.url || apply?.bluesky);
}

/**
 * The offer's page on joblist. The DID's colons are encoded, as the static
 * host serves it (it redirects the unencoded form).
 * @param {string} did
 * @param {string} rkey
 */
export function postPath(did, rkey) {
	return config.jobPost.page.replace('{did}', encodeURIComponent(did)).replace('{rkey}', encodeURIComponent(rkey));
}

/**
 * A today.joblist.job record from form values.
 * @param {JobForm} form
 * @param {{page: string, createdAt?: string, now?: number}} options
 *   page: the offer's joblist URL, used as `url` when no other page is given
 */
export function toRecord(form, { page, createdAt, now = Date.now() }) {
	/** @type {Record<string, any>} */
	const record = {
		$type: config.collections.job,
		title: form.title.trim(),
		company: form.company,
		url: form.offerUrl.trim() ? withScheme(form.offerUrl) : page
	};
	if (form.description.trim()) record.description = form.description.trim();
	const locations = form.locations.filter((l) => Object.values(l).some((x) => String(x || '').trim()));
	if (locations.length) record.locations = locations;
	if (form.remote) record.remote = form.remote;
	if (form.employment) record.employment = form.employment;
	/** @type {Apply} */
	const apply = {};
	const url = toApplyUrl(form.applyTo);
	if (url) apply.url = url;
	if (form.bluesky) apply.bluesky = true;
	if (canApply(apply)) record.apply = apply;
	record.createdAt = createdAt || new Date(now).toISOString();
	record.expiresAt = expiryDate(form.days, now);
	return record;
}

/**
 * Form values from an offer (or empty, for a company).
 * @param {JobPost | null} post
 * @param {string} [company]
 * @param {number} [now]
 */
export function toForm(post, company = '', now = Date.now()) {
	const own = post && post.url !== postPageUrl(post) ? post.url : '';
	const apply = post?.apply.url || '';
	return {
		company: post?.company || company,
		title: post?.title || '',
		description: post?.description || '',
		locations: (post?.locations || []).map((l) => ({ ...l })),
		remote: post?.remote || '',
		employment: post?.employment || '',
		offerUrl: own,
		applyTo: apply.replace(/^mailto:/i, ''),
		bluesky: Boolean(post?.apply.bluesky),
		days: post ? daysLeft(post.expiresAt, now) || DEFAULT_DAYS : DEFAULT_DAYS
	};
}

/** @param {{did: string, rkey: string}} post */
export function postPageUrl({ did, rkey }) {
	return config.url + postPath(did, rkey);
}

/**
 * @param {RepoRecord} record
 * @param {Map<string, {handle: string}>} profiles
 * @returns {JobPost}
 */
export function toPost(record, profiles) {
	const v = record.value;
	return {
		uri: record.uri,
		did: record.did,
		rkey: record.rkey,
		title: String(v.title || ''),
		company: String(v.company || ''),
		url: safeUrl(v.url),
		description: String(v.description || ''),
		locations: Array.isArray(v.locations) ? v.locations : [],
		remote: v.remote,
		employment: v.employment,
		apply: v.apply && typeof v.apply === 'object' ? { ...v.apply, url: safeUrl(v.apply.url, { email: true }) || undefined } : {},
		createdAt: String(v.createdAt || ''),
		expiresAt: String(v.expiresAt || ''),
		verified: profiles.get(record.did)?.handle === v.company,
		record
	};
}

/**
 * An offer as a job in job lists.
 * @param {JobPost} post
 * @returns {Job}
 */
export function toJob(post) {
	return {
		title: post.title,
		url: post.url,
		company: post.company,
		location: placeNames(post.locations) || undefined,
		published: post.createdAt,
		remote: post.remote,
		posted: { did: post.did, rkey: post.rkey, verified: post.verified }
	};
}

/** @param {Location[]} locations */
export function placeNames(locations) {
	return [...new Set(locations.map((l) => [l.name, l.country].filter(Boolean).join(', ')).filter(Boolean))].join('; ');
}

/**
 * Posted jobs and job board jobs, one per link: posted first (the company's
 * own before shared ones), then job board jobs not already posted.
 * @param {Job[]} posted
 * @param {Job[]} board
 */
export function mergeJobs(posted, board) {
	const seen = new Set();
	const ranked = [...posted].sort((a, b) => Number(Boolean(b.posted?.verified)) - Number(Boolean(a.posted?.verified)));
	return [...ranked, ...board].filter((job) => !seen.has(job.url) && seen.add(job.url));
}

/**
 * Jobs the company posted itself, then those others posted, then the rest,
 * keeping each group's order.
 * @param {Job[]} jobs
 */
export function postedFirst(jobs) {
	const rank = (/** @type {Job} */ j) => (j.posted ? (j.posted.verified ? 0 : 1) : 2);
	return [...jobs].sort((a, b) => rank(a) - rank(b));
}

/** @param {string} url */
function withScheme(url) {
	const value = url.trim();
	return value.includes('://') ? value : `https://${value}`;
}
