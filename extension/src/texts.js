/**
 * The add-on's texts (extension.*), in the browser's language; built in by
 * scripts/build-extension.js (env.d.ts).
 */
const MESSAGES = __MESSAGES__;
export const locale = MESSAGES[(navigator.language || 'en').slice(0, 2)] ? (navigator.language || 'en').slice(0, 2) : 'en';
const messages = MESSAGES[locale];

/**
 * @param {string} key without "extension."
 * @param {Record<string, string | number>} [vars]
 */
export function t(key, vars = {}) {
	const one = vars.count === 1 && messages[`extension.${key}.one`];
	let text = one || messages[`extension.${key}`] || MESSAGES.en[`extension.${key}`] || key;
	for (const [name, value] of Object.entries(vars)) text = text.replaceAll(`{${name}}`, typeof value === 'number' ? value.toLocaleString(locale) : value);
	return text;
}
