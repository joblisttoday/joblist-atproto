/**
 * The app's texts in the embed (in place of src/lib/i18n/index.svelte.js, by
 * scripts/build-embed.js): the keys it shows (job.*, embed.*), in each language, built in.
 */
const MESSAGES = __EMBED__.strings;

/** The language read, set by the element (lang="…", the page's, the browser's). */
export const i18n = $state({ locale: 'en' });

/**
 * @param {string} key
 * @param {Record<string, string | number>} [vars] "{count} jobs" has a "….one" for 1
 */
export function t(key, vars = {}) {
	const texts = MESSAGES[i18n.locale] || MESSAGES.en;
	const one = vars.count === 1 && (texts[`${key}.one`] || MESSAGES.en[`${key}.one`]);
	let text = one || texts[key] || MESSAGES.en[key] || key;
	for (const [name, value] of Object.entries(vars)) text = text.replaceAll(`{${name}}`, typeof value === 'number' ? value.toLocaleString(i18n.locale) : String(value));
	return text;
}
