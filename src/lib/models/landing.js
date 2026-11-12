/** Slugs for words, and what can be an organization's key. */

/** The longest slug made (a place's or a word's). */
const SLUG_MAX = 60;

/**
 * A name as a slug: "São Paulo" → "sao-paulo"; '' when nothing is left (東京).
 * @param {string} name
 */
export function slugify(name) {
	return String(name ?? '')
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, SLUG_MAX)
		.replace(/-+$/, '');
}

/**
 * A company key safe in an address: a domain (or an older slug), never a TID (since 2023:
 * 13 characters from a digit), the key a generic atproto app gives a new record of any type:
 * such a record names no organization's website.
 * @param {unknown} key
 */
export function isCompanyKey(key) {
	return typeof key === 'string' && key.length <= 253 && /^[a-z0-9][a-z0-9.-]*$/.test(key) && !/^[2-7][2-7a-z]{12}$/.test(key);
}
