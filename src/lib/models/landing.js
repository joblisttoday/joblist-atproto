import fields from '#lib/data/fields.json' with { type: 'json' };

/**
 * The fields jobs are in (engineering, design…), found from a job's title and department,
 * slugs for words, and what can be an organization's key.
 *
 * @typedef {{slug: string, query: string, words: string[]}} Field
 *   query: what the jobs search looks for in this field; words: what a job's title or department says.
 */

/** @type {Field[]} */
export const FIELDS = fields;

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

/** @param {Field} field */
function fieldPattern(field) {
	const words = field.words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
	// Words start and end with a latin letter: \b is enough, and fast over every job.
	return new RegExp(`\\b(?:${words.join('|')})\\b`, 'i');
}
const patterns = new Map(FIELDS.map((f) => [f.slug, fieldPattern(f)]));

/**
 * The fields a job belongs to, from its title and department.
 * @param {{t: string, d?: string}} job
 * @returns {string[]} field slugs
 */
export function fieldsOf(job) {
	const text = `${job.t} ${job.d || ''}`;
	return FIELDS.filter((f) => patterns.get(f.slug)?.test(text)).map((f) => f.slug);
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
