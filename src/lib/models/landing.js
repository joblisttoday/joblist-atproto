import config from '#lib/data/config.json' with { type: 'json' };
import fields from '#lib/data/fields.json' with { type: 'json' };

/**
 * Pages per city and per field ("jobs in Berlin", "design jobs"), and their feeds.
 * Shared by the indexer (which writes their small files into the snapshot), the
 * Worker (which renders them) and the app (which shows them).
 *
 * @typedef {{slug: string, query: string, words: string[]}} Field
 *   query: what the explorer searches for this field; words: what a job's title or department says.
 * @typedef {{t: string, u: string, c: string, l?: string, d?: string, p?: string, r?: string, i?: string, m?: [number, number, string, string]}} LandingJob
 *   A job as these pages show it: title, link (its board, or its page here), company key,
 *   location, department and pay (the recent jobs searched by feeds only), first seen, workplace,
 *   id at its board (when the link does not end with it).
 * @typedef {{generatedAt: string, name?: string, count: number, names: Record<string, string>, jobs: LandingJob[],
 *   fields?: {slug: string, count: number}[], cities?: {slug: string, name: string, count: number}[], page?: number, pages?: number}} LandingFile
 *   One page's data: the newest jobs and their companies' names; a city's fields, a field's cities;
 *   which page of them it is (from 1) of how many (config.landing.pages at most, of config.landing.shown jobs each).
 * @typedef {{generatedAt: string, total: number, cities: {slug: string, name: string, count: number, updated?: string, fields: string[]}[], fields: {slug: string, count: number, updated?: string}[]}} LandingIndex
 *   cities[].fields: the fields with a page in that city; updated: when its newest job was first seen.
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
 * The page's feed: /feed/in/berlin.xml…; /feed/new.xml for every new job;
 * /feed/search.xml?q=design&where=Lisbon for any explorer search.
 * @param {{city?: string, field?: string, company?: string, search?: string}} page
 *   search: an explorer search's address query ("?q=design", see saved-search.js toParams)
 */
export function feedPath({ city, field, company, search }) {
	if (search !== undefined) return `${config.searchFeed.path}${search}`;
	if (company) return `/feed/company/${company}.xml`;
	if (!city && !field) return '/feed/new.xml';
	return `/feed${landingPath({ city, field })}.xml`;
}

/**
 * The page's file in the snapshot (relative to the snapshot's root): its next pages of
 * older jobs have their own (landing/in/berlin.2.json).
 * @param {{city?: string, field?: string, page?: number}} page none: the newest jobs
 */
export function landingFile({ city, field, page = 1 }) {
	const { dir } = config.landing;
	if (!city && !field) return `${dir}/new.json`;
	return `${dir}${landingPath({ city, field })}${page > 1 ? `.${page}` : ''}.json`;
}

/**
 * Where a page of a city's or a field's jobs is: /in/berlin, /in/berlin?page=2.
 * @param {{city?: string, field?: string, page?: number}} page
 */
export function pagedPath({ city, field, page = 1 }) {
	return `${landingPath({ city, field })}${page > 1 ? `?page=${page}` : ''}`;
}

/**
 * The page number an address asks for: 1 when none; null when it is not one ("?page=x", "?page=1").
 * @param {string | null} value the ?page= of the address
 */
export function pageNumber(value) {
	if (value === null) return 1;
	const n = /^[1-9]\d{0,2}$/.test(value) ? Number(value) : 0;
	return n > 1 && n <= config.landing.pages ? n : null;
}

export const indexFile = () => `${config.landing.dir}/index.json`;

/**
 * The same search in the explorer: /#where=Berlin&q=design (after the "#": see navigation/address.js).
 * @param {{cityName?: string, field?: string}} page
 */
export function explorerPath({ cityName, field }) {
	const params = new URLSearchParams();
	const query = field ? fieldOf(field)?.query : '';
	if (query) params.set('q', query);
	if (cityName) params.set('where', cityName);
	const text = params.toString();
	return text ? `/#${text}` : '/';
}

/**
 * A company key safe in an address and a file name (as the indexer writes them).
 * @param {unknown} key
 */
export function isCompanyKey(key) {
	return typeof key === 'string' && key.length <= 253 && /^[a-z0-9][a-z0-9.-]*$/.test(key);
}

/**
 * The feed of an explorer search, when it has one: a city with a page, alone
 * or with one field's search words.
 * @param {LandingIndex | null} index
 * @param {{query: string, where: string, remote: string}} filters
 * @returns {{city: string, field?: string} | null}
 */
export function searchFeed(index, filters) {
	const where = filters.where.trim().toLowerCase();
	if (!index || filters.remote || !where) return null;
	const city = index.cities.find((c) => c.name.toLowerCase() === where);
	if (!city) return null;
	const query = filters.query.trim().toLowerCase();
	if (!query) return { city: city.slug };
	const field = FIELDS.find((f) => f.query === query && city.fields?.includes(f.slug));
	return field ? { city: city.slug, field: field.slug } : null;
}
