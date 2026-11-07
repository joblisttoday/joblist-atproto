import config from '#lib/data/config.json' with { type: 'json' };
import fields from '#lib/data/fields.json' with { type: 'json' };

/**
 * Pages per city and per field ("jobs in Berlin", "design jobs"), and their feeds.
 * Shared by the indexer (which writes their small files into the snapshot), the
 * Worker (which renders them) and the app (which shows them).
 *
 * @typedef {{slug: string, query: string, words: string[]}} Field
 *   query: what the explorer searches for this field; words: what a job's title or department says.
 * @typedef {{t: string, u: string, c: string, l?: string, p?: string, r?: string}} LandingJob
 *   A job as these pages show it: title, link (its board, or its page here), company key,
 *   location, first seen, workplace.
 * @typedef {{generatedAt: string, name?: string, count: number, names: Record<string, string>, jobs: LandingJob[],
 *   fields?: {slug: string, count: number}[], cities?: {slug: string, name: string, count: number}[]}} LandingFile
 *   One page's data: the newest jobs and their companies' names; a city's fields, a field's cities.
 * @typedef {{generatedAt: string, total: number, cities: {slug: string, name: string, count: number}[], fields: {slug: string, count: number}[]}} LandingIndex
 */

/** @type {Field[]} */
export const FIELDS = fields;

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * A place's name as an address: "São Paulo" → "sao-paulo"; '' when nothing is left (東京).
 * @param {string} name
 */
export function slugify(name) {
	return String(name ?? '')
		.normalize('NFKD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, config.landing.slugMax)
		.replace(/-+$/, '');
}

/**
 * Whether a piece of an address can be a city or field slug (anything else is never looked up).
 * @param {unknown} value
 */
export function isSlug(value) {
	return typeof value === 'string' && value.length <= config.landing.slugMax && slugPattern.test(value);
}

/** @param {string} slug */
export const fieldOf = (slug) => FIELDS.find((f) => f.slug === slug);

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
 * Where a page is: /in, /in/berlin, /in/berlin/design, /field, /field/design.
 * @param {{city?: string, field?: string}} page
 */
export function landingPath({ city, field }) {
	if (city) return field ? `/in/${city}/${field}` : `/in/${city}`;
	return field ? `/field/${field}` : '/in';
}

/**
 * The page's feed: /feed/in/berlin.xml…; /feed/new.xml for every new job.
 * @param {{city?: string, field?: string, company?: string}} page
 */
export function feedPath({ city, field, company }) {
	if (company) return `/feed/company/${company}.xml`;
	if (!city && !field) return '/feed/new.xml';
	return `/feed${landingPath({ city, field })}.xml`;
}

/**
 * The page's file in the snapshot (relative to the snapshot's root).
 * @param {{city?: string, field?: string}} page none: the newest jobs
 */
export function landingFile({ city, field }) {
	const { dir } = config.landing;
	if (!city && !field) return `${dir}/new.json`;
	return `${dir}${landingPath({ city, field })}.json`;
}

export const indexFile = () => `${config.landing.dir}/index.json`;

/**
 * The same search in the explorer: /?where=Berlin&q=design.
 * @param {{cityName?: string, field?: string}} page
 */
export function explorerPath({ cityName, field }) {
	const params = new URLSearchParams();
	const query = field ? fieldOf(field)?.query : '';
	if (query) params.set('q', query);
	if (cityName) params.set('where', cityName);
	const text = params.toString();
	return text ? `/?${text}` : '/';
}

/**
 * A company key safe in an address and a file name (as the indexer writes them).
 * @param {unknown} key
 */
export function isCompanyKey(key) {
	return typeof key === 'string' && key.length <= 253 && /^[a-z0-9][a-z0-9.-]*$/i.test(key);
}
