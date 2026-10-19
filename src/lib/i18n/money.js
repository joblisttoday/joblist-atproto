/**
 * "49 €" or "€49", in the given language.
 * @param {number} amount
 * @param {string} currency ISO 4217 code
 * @param {string} locale
 */
export function money(amount, currency, locale) {
	return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}
