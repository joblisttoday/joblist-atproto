import { safeUrl } from './url.js';
import { locationPoints, speaksFor } from './company.js';
import { toSalary } from '#lib/ats/salary.js';
import { capRecord } from './limits.js';
import config from '#lib/data/config.json' with { type: 'json' };

/**
 * Job offers posted as today.joblist.job records, in the poster's own account.
 * Applications never go through joblist: `apply` only says where to send them.
 *
 * @typedef {import('#lib/atproto/records.js').RepoRecord} RepoRecord
 * @typedef {import('#lib/models/company.js').Location} Location
 * @typedef {import('#lib/ats/job.js').Job} Job
 * @typedef {import('#lib/ats/salary.js').Salary} Salary
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
 *   salary?: Salary,
 *   status: string,
 *   createdAt: string,
 *   updatedAt?: string,
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
 *   days: number,
 *   salaryMin?: string,
 *   salaryMax?: string,
 *   currency?: string,
 *   period?: string,
 *   status?: string
 * }} JobForm
 *   salaryMin, salaryMax: whole amounts as typed; currency: ISO 4217 code; period: year, month…;
 *   status: open (default), filled or closed.
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
	// Filled or closed: the poster says it no longer takes applications.
	if (value.status && value.status !== config.jobPost.status[0]) return false;
	const expires = Date.parse(String(value.expiresAt || ''));
	// Never beyond the longest an offer runs from now: a date years away would keep it up for good.
	return Number.isFinite(expires) && expires > now && expires <= now + (MAX_DAYS + 1) * DAY;
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
	const salary = wholeSalary(toSalary({ min: form.salaryMin, max: form.salaryMax, currency: form.currency, period: form.period }));
	if (salary) record.salary = salary;
	if (form.status && form.status !== config.jobPost.status[0] && config.jobPost.status.includes(form.status)) record.status = form.status;
	record.createdAt = createdAt || new Date(now).toISOString();
	// Edited: when, as the poster says (createdAt is kept).
	if (createdAt) record.updatedAt = new Date(now).toISOString();
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
		days: post ? daysLeft(post.expiresAt, now) || DEFAULT_DAYS : DEFAULT_DAYS,
		salaryMin: post?.salary?.min ? String(post.salary.min) : '',
		salaryMax: post?.salary?.max ? String(post.salary.max) : '',
		currency: post?.salary?.currency || '',
		period: post?.salary?.period || '',
		status: post?.status || config.jobPost.status[0]
	};
}

/** @param {{did: string, rkey: string}} post */
export function postPageUrl({ did, rkey }) {
	return config.url + postPath(did, rkey);
}

/**
 * @param {RepoRecord} record
 * @param {Map<string, import('./company.js').Handle>} profiles
 * @returns {JobPost}
 */
export function toPost(record, profiles) {
	// Anyone can post: only what the lexicon allows is shown.
	const v = capRecord(config.collections.job, record.value);
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
		salary: v.salary && typeof v.salary === 'object' ? wholeSalary(toSalary(v.salary)) : undefined,
		status: typeof v.status === 'string' && v.status ? v.status : config.jobPost.status[0],
		createdAt: String(v.createdAt || ''),
		updatedAt: typeof v.updatedAt === 'string' ? v.updatedAt : undefined,
		expiresAt: String(v.expiresAt || ''),
		verified: speaksFor(profiles, record.did, String(v.company || '')),
		record
	};
}

/**
 * An offer as a job in job lists.
 * @param {JobPost} post
 * @returns {Job}
 */
export function toJob(post) {
	// Where it is, when the poster says it (the snapshot finds the others, see withPoints).
	const [at] = locationPoints(post.locations);
	return {
		title: post.title,
		url: post.url,
		company: post.company,
		location: placeNames(post.locations) || undefined,
		published: post.createdAt,
		remote: post.remote,
		salary: post.salary,
		posted: { did: post.did, rkey: post.rkey, verified: post.verified },
		point: at && [at.lon, at.lat]
	};
}

/**
 * Posted jobs with the place the snapshot found for them, when they do not say it.
 * @param {Job[]} jobs
 * @param {Map<string, [number, number]>} points by record address (at://…)
 */
export function withPoints(jobs, points) {
	if (!points.size) return jobs;
	return jobs.map((job) => {
		if (job.point || !job.posted) return job;
		const point = points.get(`at://${job.posted.did}/${config.collections.job}/${job.posted.rkey}`);
		return point ? { ...job, point } : job;
	});
}

/** @param {Location[]} locations */
export function placeNames(locations) {
	return [...new Set(locations.map((l) => [l.name, l.country].filter(Boolean).join(', ')).filter(Boolean))].join('; ');
}

/**
 * Posted jobs and job board jobs, one per link: the company's own posts, then its
 * job board, then posts shared by others. A shared post with a board job's link
 * never replaces it: anyone can post, only the company and its board say what the job is.
 * @param {Job[]} posted
 * @param {Job[]} board
 */
export function mergeJobs(posted, board) {
	const seen = new Set();
	const own = posted.filter((job) => job.posted?.verified);
	const shared = posted.filter((job) => !job.posted?.verified);
	return [...own, ...board, ...shared].filter((job) => !seen.has(job.url) && seen.add(job.url));
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

/**
 * A pay range in whole units, as the record keeps it (integers).
 * @param {Salary | undefined} salary
 * @returns {Salary | undefined}
 */
function wholeSalary(salary) {
	if (!salary) return undefined;
	/** @type {Salary} */
	const whole = { currency: salary.currency, period: salary.period };
	if (salary.min) whole.min = Math.round(salary.min);
	if (salary.max) whole.max = Math.round(salary.max);
	return whole;
}

/** @param {string} url */
function withScheme(url) {
	const value = url.trim();
	return value.includes('://') ? value : `https://${value}`;
}
