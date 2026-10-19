const units = /** @type {const} */ ([
	['year', 365 * 24 * 3600e3],
	['month', 30 * 24 * 3600e3],
	['week', 7 * 24 * 3600e3],
	['day', 24 * 3600e3]
]);

/**
 * "3 days ago", in the given language; '' for an unknown time.
 * @param {number} ms
 * @param {string} locale
 * @param {number} [now]
 */
export function ago(ms, locale, now = Date.now()) {
	if (!ms) return '';
	const diff = ms - now;
	const format = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
	for (const [unit, size] of units) {
		if (Math.abs(diff) >= size) return format.format(Math.round(diff / size), unit);
	}
	return format.format(0, 'day');
}

/**
 * "19 December 2026", in the given language; '' for an unknown date.
 * @param {string} value
 * @param {string} locale
 */
export function longDate(value, locale) {
	const ms = Date.parse(value);
	return Number.isFinite(ms) ? new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(ms) : '';
}
