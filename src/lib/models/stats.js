/**
 * The trends file (indexer/stats.js), read and checked as the /stats page uses it.
 * @typedef {import('../../../indexer/stats.js').Stats} Stats
 * @typedef {import('../../../indexer/stats.js').Week} Week
 */

const num = (/** @type {unknown} */ n) => (typeof n === 'number' && Number.isFinite(n) && n >= 0 ? n : 0);
const counts = (/** @type {unknown} */ o) =>
	Object.fromEntries(Object.entries(o && typeof o === 'object' ? o : {}).map(([k, v]) => [k, num(v)]));

/**
 * The file, checked (it comes from the network): null when it is not one.
 * @param {any} data
 * @returns {Stats | null}
 */
export function readStats(data) {
	if (!data || !Array.isArray(data.weeks) || !data.now || typeof data.now !== 'object') return null;
	const now = data.now;
	return {
		generatedAt: String(data.generatedAt || ''),
		since: String(data.since || ''),
		weeks: data.weeks
			.filter((/** @type {any} */ w) => w && /^\d{4}-\d{2}-\d{2}$/.test(w.week))
			.map((/** @type {any} */ w) => ({ week: w.week, new: num(w.new), closed: num(w.closed), open: num(w.open), ...(w.partial && { partial: true }), fields: counts(w.fields), cities: counts(w.cities) })),
		now: {
			open: num(now.open),
			companies: num(now.companies),
			newWeek: num(now.newWeek),
			newWeekBefore: now.newWeekBefore === null ? null : num(now.newWeekBefore),
			daysOpen: now.daysOpen === null ? null : num(now.daysOpen),
			workplace: { onsite: num(now.workplace?.onsite), hybrid: num(now.workplace?.hybrid), remote: num(now.workplace?.remote), unsaid: num(now.workplace?.unsaid) },
			payShown: num(now.payShown),
			fields: (Array.isArray(now.fields) ? now.fields : [])
				.filter((/** @type {any} */ f) => typeof f?.slug === 'string')
				.map((/** @type {any} */ f) => ({ slug: f.slug, open: num(f.open), daysOpen: f.daysOpen === null ? null : num(f.daysOpen), pay: counts(f.pay) })),
			cities: (Array.isArray(now.cities) ? now.cities : [])
				.filter((/** @type {any} */ c) => typeof c?.slug === 'string')
				.map((/** @type {any} */ c) => ({ slug: c.slug, name: String(c.name || c.slug), open: num(c.open) }))
		}
	};
}

/**
 * Change from one count to the next, in percent (rounded): null when there is nothing to compare to.
 * @param {number} now
 * @param {number | null} before
 */
export function change(now, before) {
	return before ? Math.round(((now - before) / before) * 100) : null;
}

/**
 * A part of a whole, in percent (rounded).
 * @param {number} part
 * @param {number} whole
 */
export function share(part, whole) {
	return whole ? Math.round((part / whole) * 100) : 0;
}

/**
 * A percent as written in a language: 44% in English, 44 % in French.
 * @param {number} value 0 to 100
 * @param {string} locale
 */
export function percent(value, locale) {
	return (value / 100).toLocaleString(locale, { style: 'percent' });
}

/**
 * The currencies pay is most often given in, across fields (columns of the pay table).
 * @param {{pay: Record<string, number>}[]} fields
 * @param {number} most
 */
export function payCurrencies(fields, most) {
	/** @type {Map<string, number>} */
	const seen = new Map();
	for (const f of fields) for (const c of Object.keys(f.pay)) seen.set(c, (seen.get(c) || 0) + 1);
	return [...seen].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, most).map(([c]) => c);
}

/**
 * New offers of a field (or a city) each week, oldest first.
 * @param {Week[]} weeks
 * @param {'fields' | 'cities'} by
 * @param {string} slug
 */
export function weekly(weeks, by, slug) {
	return weeks.map((w) => w[by][slug] || 0);
}
