/**
 * The small files behind the pages per city and per field (/in/berlin,
 * /field/design, /in/berlin/design) and their feeds: each with the newest
 * jobs only, so the Worker that renders them reads a few kilobytes, never
 * jobs.json. Written into the snapshot with the other files (index.js).
 *
 * Cities: the places job boards name that were found as a city (the places
 * cache: countries and regions are not), by their first part ("Berlin,
 * Germany" → Berlin), merged by config.landing.cityAliases (NYC → New York).
 * Fields: src/lib/data/fields.json, from each job's title and department.
 */
import config from '../src/lib/data/config.json' with { type: 'json' };
import { postPageUrl } from '../src/lib/models/job-post.js';
import { FIELDS, fieldsOf, indexFile, landingFile, slugify } from '../src/lib/models/landing.js';
import { placeKey, placeNames } from './places.js';

/**
 * @typedef {import('./jobs.js').IndexedJob} IndexedJob
 * @typedef {import('./places.js').PlaceCache} PlaceCache
 * @typedef {import('../src/lib/models/landing.js').LandingJob} LandingJob
 * @typedef {import('../src/lib/models/landing.js').LandingFile} LandingFile
 */

const { landing } = config;
const aliases = /** @type {Record<string, string>} */ (landing.cityAliases);

/**
 * The cities a job is in, as found in the places cache.
 * @param {IndexedJob} job
 * @param {PlaceCache} places
 * @returns {{slug: string, name: string}[]}
 */
export function citiesOf(job, places) {
	/** @type {Map<string, string>} */
	const found = new Map();
	for (const place of placeNames(job.l)) {
		if (!places[placeKey(place)]) continue;
		const name = place.split(',')[0].trim();
		const slug = slugify(name);
		if (slug) found.set(aliases[slug] || slug, name);
	}
	return [...found].map(([slug, name]) => ({ slug, name }));
}

/**
 * Where a job is read: a job posted here has its page, a board's job its board.
 * @param {IndexedJob} job
 */
function jobLink(job) {
	const [, did, , rkey] = (job.s || '').match(/^at:\/\/([^/]+)\/([^/]+)\/([^/]+)$/) || [];
	return did ? postPageUrl({ did, rkey }) : job.u;
}

/**
 * The newest jobs of a page, one per company and title, as the page shows them.
 * @param {IndexedJob[]} jobs newest first
 * @param {number} [most] how many
 */
function newest(jobs, most = landing.shown) {
	const seen = new Set();
	/** @type {LandingJob[]} */
	const shown = [];
	for (const job of jobs) {
		const key = `${job.c}\n${job.t.trim().toLowerCase()}`;
		if (seen.has(key)) continue;
		seen.add(key);
		shown.push({ t: job.t, u: jobLink(job), c: job.c, l: job.l, p: job.p, r: job.r, i: job.i });
		if (shown.length >= most) break;
	}
	return shown;
}

/**
 * The most common spelling of each city ("Bangalore" over "bangalore").
 * @param {Map<string, Map<string, number>>} spellings
 * @param {string} slug
 */
function nameOf(spellings, slug) {
	return [...(spellings.get(slug) || [])].sort((a, b) => b[1] - a[1])[0]?.[0] || slug;
}

/**
 * Every landing file, by its path in the snapshot.
 * @param {IndexedJob[]} jobs
 * @param {Map<string, string>} names company names by key
 * @param {PlaceCache} places
 * @param {string} generatedAt
 * @returns {[string, LandingFile | import('../src/lib/models/landing.js').LandingIndex][]}
 */
export function landingFiles(jobs, names, places, generatedAt) {
	// Dates are ISO strings: compared as text (localeCompare is slow over every job).
	const sorted = [...jobs].sort((a, b) => ((b.p || '') > (a.p || '') ? 1 : (b.p || '') < (a.p || '') ? -1 : 0));
	/** @type {Map<string, IndexedJob[]>} by city slug, field slug, or "city/field" */
	const groups = new Map();
	/** @type {Map<string, Map<string, number>>} */
	const spellings = new Map();
	/** @param {string} key @param {IndexedJob} job */
	const add = (key, job) => {
		const list = groups.get(key);
		if (list) list.push(job);
		else groups.set(key, [job]);
	};
	for (const job of sorted) {
		const cities = citiesOf(job, places);
		const fields = fieldsOf(job);
		for (const { slug, name } of cities) {
			add(`in/${slug}`, job);
			const counts = spellings.get(slug) || new Map();
			counts.set(name, (counts.get(name) || 0) + 1);
			spellings.set(slug, counts);
			for (const field of fields) add(`in/${slug}/${field}`, job);
		}
		for (const field of fields) add(`field/${field}`, job);
	}
	const count = (/** @type {string} */ key) => groups.get(key)?.length || 0;
	// When a page last changed: its newest job (groups are newest first).
	const updated = (/** @type {string} */ key) => groups.get(key)?.[0]?.p || undefined;
	const cities = [...groups.keys()]
		.filter((key) => /^in\/[^/]+$/.test(key) && count(key) >= landing.minJobs.city)
		.map((key) => key.slice(3))
		.sort((a, b) => count(`in/${b}`) - count(`in/${a}`) || a.localeCompare(b));
	const fields = FIELDS.map((f) => f.slug).filter((slug) => count(`field/${slug}`) >= landing.minJobs.field);
	const pairs = cities.flatMap((city) => fields.filter((field) => count(`in/${city}/${field}`) >= landing.minJobs.cityField).map((field) => ({ city, field })));

	/** @param {IndexedJob[]} group @param {Partial<LandingFile>} extra @param {LandingJob[]} [shown] */
	const file = (group, extra = {}, shown = newest(group)) => {
		const companies = Object.fromEntries(shown.map((j) => [j.c, names.get(j.c) || j.c]));
		return { generatedAt, ...extra, count: group.length, names: companies, jobs: shown };
	};
	/**
	 * A page's files: its newest jobs, then pages of older ones (config.landing.pages at most).
	 * @param {{city?: string, field?: string}} page
	 * @param {IndexedJob[]} group
	 * @param {Partial<LandingFile>} extra
	 * @returns {[string, LandingFile][]}
	 */
	const paged = (page, group, extra) => {
		const all = newest(group, landing.shown * landing.pages);
		const pages = Math.max(1, Math.ceil(all.length / landing.shown));
		return Array.from({ length: pages }, (_, i) => [
			landingFile({ ...page, page: i + 1 }),
			file(group, { ...extra, page: i + 1, pages }, all.slice(i * landing.shown, (i + 1) * landing.shown))
		]);
	};
	/** @type {[string, any][]} */
	const out = [
		[
			indexFile(),
			{
				generatedAt,
				total: jobs.length,
				cities: cities.map((slug) => ({
					slug,
					name: nameOf(spellings, slug),
					count: count(`in/${slug}`),
					updated: updated(`in/${slug}`),
					fields: pairs.filter((p) => p.city === slug).map((p) => p.field)
				})),
				fields: fields.map((slug) => ({ slug, count: count(`field/${slug}`), updated: updated(`field/${slug}`) }))
			}
		],
		[landingFile({}), file(sorted)]
	];
	for (const city of cities) {
		const own = pairs.filter((p) => p.city === city).map(({ field }) => ({ slug: field, count: count(`in/${city}/${field}`) }));
		out.push(...paged({ city }, groups.get(`in/${city}`) || [], { name: nameOf(spellings, city), fields: own }));
	}
	for (const field of fields) {
		const own = pairs
			.filter((p) => p.field === field)
			.map(({ city }) => ({ slug: city, name: nameOf(spellings, city), count: count(`in/${city}/${field}`) }))
			.sort((a, b) => b.count - a.count);
		out.push(...paged({ field }, groups.get(`field/${field}`) || [], { cities: own }));
	}
	for (const { city, field } of pairs) {
		out.push(...paged({ city, field }, groups.get(`in/${city}/${field}`) || [], { name: nameOf(spellings, city) }));
	}
	return out;
}
