import config from '../src/lib/data/config.json' with { type: 'json' };
import en from '../src/lib/i18n/locales/en.json' with { type: 'json' };
import { safeUrl } from '../src/lib/models/url.js';

/**
 * The words of these pages, in the default language (as prerendered pages):
 * the app shows its own language once it starts.
 * @param {string} key
 * @param {Record<string, string | number>} [vars]
 */
export function t(key, vars = {}) {
	const messages = /** @type {Record<string, string>} */ (en);
	if (vars.count === 1 && `${key}.one` in messages) key = `${key}.one`;
	return (messages[key] ?? key).replace(/\{(\w+)\}/g, (_, name) => {
		const value = vars[name];
		return typeof value === 'number' ? value.toLocaleString(config.defaultLocale) : String(value ?? '');
	});
}

/**
 * A date as Atom and HTML want it (RFC 3339, with seconds): '' when it is not one.
 * @param {unknown} value "2026-11-02T17:49Z"
 */
export function isoDate(value) {
	const ms = typeof value === 'string' ? Date.parse(value) : NaN;
	return Number.isFinite(ms) ? new Date(ms).toISOString().replace(/\.\d{3}Z$/, 'Z') : '';
}

/**
 * A job from a snapshot file, checked: the file is ours, what is in it is anyone's.
 * @param {any} row
 * @param {Record<string, unknown>} names company names by key
 * @returns {{title: string, url: string, company: string, companyName: string, location: string, date: string, workplace: string} | null}
 *   null: no title or no web link
 */
export function toItem(row, names) {
	const title = String(row?.t ?? '').trim();
	const url = safeUrl(row?.u);
	if (!title || !url) return null;
	const company = String(row.c ?? '');
	const workplace = ['onsite', 'hybrid', 'remote'].includes(row.r) ? t(`job.remote.${row.r}`) : '';
	return { title, url, company, companyName: String(names?.[company] ?? company), location: String(row.l ?? ''), date: isoDate(row.p), workplace };
}

/** @param {{field?: string}} page */
export const fieldName = ({ field }) => (field ? t(`field.${field}`) : '');

/**
 * The page's title: "Design jobs in Berlin".
 * @param {{city?: string, field?: string}} page
 * @param {string} cityName
 */
export function pageTitle(page, cityName) {
	if (page.city && page.field) return t('landing.cityField', { city: cityName, field: fieldName(page) });
	if (page.city) return t('landing.city', { city: cityName });
	if (page.field) return t('landing.field', { field: fieldName(page) });
	return t('landing.newest');
}
