import config from '#lib/data/config.json' with { type: 'json' };

/**
 * joblist's two records (lexicons/), as pages show them and forms write them:
 * today.joblist.company (an organization describing itself, keyed by its domain) and
 * today.joblist.job (a job offer it posts). Written by anyone: links are checked before
 * they are shown, dates before an offer is.
 * A form writes over the record it edits, so fields it does not show are kept as they are.
 */

const DAY = 24 * 3600 * 1000;
const { days: DEFAULT_DAYS, maxDays: MAX_DAYS } = config.jobPost;

/**
 * Only web links (and email to apply) are followed: a link never runs script here.
 * @param {unknown} value
 * @param {{email?: boolean}} [options]
 */
export function safeUrl(value, { email = false } = {}) {
	const text = String(value ?? '').trim();
	try {
		const { protocol } = new URL(text);
		return protocol === 'https:' || protocol === 'http:' || (email && protocol === 'mailto:') ? text : '';
	} catch {
		return '';
	}
}

/** A link typed without its scheme gets https://. @param {string} text */
export const withScheme = (text) => {
	const value = text.trim();
	return !value || /^[a-z][a-z0-9+.-]*:/i.test(value) ? value : `https://${value}`;
};

/** An application link: a web page, or an email address (mailto:). @param {string} text */
export function toApplyUrl(text) {
	const value = (text || '').trim();
	if (!value) return '';
	if (/^mailto:/i.test(value)) return value;
	if (/^[^\s@/:]+@[^\s@/]+\.[^\s@/]+$/.test(value)) return `mailto:${value}`;
	return withScheme(value);
}

/** The words of a list typed with commas, each once. @param {string} text */
const words = (text) => [...new Set(text.split(',').map((w) => w.trim()).filter(Boolean))];

/* — An organization — */

/**
 * @typedef {{name: string, url: string, description: string, kind: string, tags: string}} CompanyForm
 */

/**
 * What its page shows of its record.
 * @param {Record<string, any>} value
 */
export function toCompany(value) {
	return {
		name: String(value.name || ''),
		url: safeUrl(value.url),
		description: String(value.description || ''),
		kind: String(value.kind || ''),
		tags: Array.isArray(value.tags) ? value.tags.filter((t) => typeof t === 'string') : []
	};
}

/**
 * The form, from its record (or empty, its website its domain).
 * @param {string} domain
 * @param {Record<string, any> | null} [value]
 * @returns {CompanyForm}
 */
export function companyForm(domain, value) {
	const c = toCompany(value || {});
	return { name: c.name, url: c.url || `https://${domain}`, description: c.description, kind: c.kind, tags: c.tags.join(', ') };
}

/**
 * The record the form writes, over the one it edits.
 * @param {CompanyForm} form
 * @param {Record<string, any> | null} [value]
 * @param {number} [now]
 */
export function companyRecord(form, value, now = Date.now()) {
	const at = new Date(now).toISOString();
	/** @type {Record<string, any>} */
	const record = { ...(value || {}), $type: config.collections.company, name: form.name.trim(), createdAt: value?.createdAt || at, updatedAt: at };
	const set = (/** @type {string} */ key, /** @type {unknown} */ v) => (v && (!Array.isArray(v) || v.length) ? (record[key] = v) : delete record[key]);
	set('url', withScheme(form.url));
	set('description', form.description.trim());
	set('kind', form.kind);
	set('tags', words(form.tags).slice(0, 20));
	return record;
}

/* — A job offer — */

/**
 * @typedef {{title: string, description: string, place: string, remote: string, employment: string, apply: string, days: number}} JobForm
 */

/**
 * Its page on joblist, also the address its record keeps when it has no other (the DID's
 * colons encoded, as the static host serves it).
 * @param {string} did
 * @param {string} rkey
 */
export const jobPath = (did, rkey) => config.jobPost.page.replace('{did}', encodeURIComponent(did)).replace('{rkey}', encodeURIComponent(rkey));

/**
 * Whether an offer is shown now: open, and not expired (never further than an offer can
 * run: a date years away would keep it up for good).
 * @param {Record<string, any>} value
 * @param {number} [now]
 */
export function isLive(value, now = Date.now()) {
	if (!value?.title || !value.company || !value.url) return false;
	if (value.status && value.status !== 'open') return false;
	const expires = Date.parse(String(value.expiresAt || ''));
	return Number.isFinite(expires) && expires > now && expires <= now + (MAX_DAYS + 1) * DAY;
}

/** Whole days before it expires, 0 when it has. @param {string} expiresAt @param {number} [now] */
export function daysLeft(expiresAt, now = Date.now()) {
	const ms = Date.parse(expiresAt) - now;
	return Number.isFinite(ms) && ms > 0 ? Math.ceil(ms / DAY) : 0;
}

/**
 * What its page shows of its record.
 * @param {Record<string, any>} value
 */
export function toJob(value) {
	const places = Array.isArray(value.locations) ? value.locations : [];
	return {
		title: String(value.title || ''),
		company: String(value.company || ''),
		description: String(value.description || ''),
		place: places.map((l) => l?.name || [l?.address, l?.country].filter(Boolean).join(', ')).filter(Boolean).join(' · '),
		remote: String(value.remote || ''),
		employment: String(value.employment || ''),
		// Where to apply: its link for it, else its own page elsewhere (not its page here).
		apply: safeUrl(value.apply?.url, { email: true }) || (String(value.url || '').startsWith(`${config.url}/job/`) ? '' : safeUrl(value.url)),
		createdAt: String(value.createdAt || ''),
		expiresAt: String(value.expiresAt || '')
	};
}

/**
 * The form, from its record (or empty).
 * @param {Record<string, any> | null} [value]
 * @param {number} [now]
 * @returns {JobForm}
 */
export function jobForm(value, now = Date.now()) {
	const j = toJob(value || {});
	const apply = safeUrl(value?.apply?.url, { email: true });
	return {
		title: j.title,
		description: j.description,
		place: j.place,
		remote: j.remote,
		employment: j.employment,
		apply: apply.replace(/^mailto:/i, ''),
		days: value ? daysLeft(j.expiresAt, now) || DEFAULT_DAYS : DEFAULT_DAYS
	};
}

/**
 * The record the form writes, over the one it edits: its page is its address when none
 * other is kept; it runs `days` more from now.
 * @param {JobForm} form
 * @param {{company: string, did: string, rkey: string}} where
 * @param {Record<string, any> | null} [value]
 * @param {number} [now]
 */
export function jobRecord(form, { company, did, rkey }, value, now = Date.now()) {
	const at = new Date(now).toISOString();
	const days = Math.min(MAX_DAYS, Math.max(1, Math.round(Number(form.days) || DEFAULT_DAYS)));
	/** @type {Record<string, any>} */
	const record = {
		...(value || {}),
		$type: config.collections.job,
		title: form.title.trim().slice(0, config.jobPost.titleMax),
		company,
		url: value?.url || `${config.url}${jobPath(did, rkey)}`,
		createdAt: value?.createdAt || at,
		updatedAt: at,
		expiresAt: new Date(now + days * DAY).toISOString()
	};
	const set = (/** @type {string} */ key, /** @type {unknown} */ v) => (v ? (record[key] = v) : delete record[key]);
	set('description', form.description.trim().slice(0, config.jobPost.descriptionMax));
	set('remote', config.jobPost.remote.includes(form.remote) ? form.remote : '');
	set('employment', config.jobPost.employment.includes(form.employment) ? form.employment : '');
	// Its place, as typed: the one it had, kept as it was when unchanged.
	if (form.place.trim() !== toJob(value || {}).place) set('locations', form.place.trim() ? [{ name: form.place.trim() }] : '');
	const apply = toApplyUrl(form.apply);
	set('apply', apply ? { ...(value?.apply || {}), url: apply } : value?.apply?.bluesky ? { bluesky: true } : '');
	return record;
}
