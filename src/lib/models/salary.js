/**
 * A pay range as people read it: "$158K–$238K", "€60–€75", in their language.
 * The period ("a year") is said by the page, in its words.
 * @typedef {import('#lib/ats/salary.js').Salary} Salary
 */

/** Amounts from this one are shortened ("$158K"). */
const COMPACT_FROM = 10000;

/** @type {Map<string, Intl.NumberFormat>} */
const formats = new Map();

/**
 * @param {string} locale
 * @param {string} currency
 * @param {boolean} compact
 */
function formatFor(locale, currency, compact) {
	const key = `${locale}\n${currency}\n${compact}`;
	let format = formats.get(key);
	if (!format) {
		format = new Intl.NumberFormat(
			locale,
			compact
				? { style: 'currency', currency, notation: 'compact', maximumSignificantDigits: 3 }
				: { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 2 }
		);
		formats.set(key, format);
	}
	return format;
}

/**
 * @param {Salary} salary
 * @param {string} locale
 */
export function payAmount({ min, max, currency }, locale) {
	const format = formatFor(locale, currency, (max ?? min ?? 0) >= COMPACT_FROM);
	if (min && max && min !== max) return format.formatRange(min, max);
	return format.format(/** @type {number} */ (min ?? max));
}
