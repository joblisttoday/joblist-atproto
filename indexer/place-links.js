/**
 * Links from the prerendered pages to the pages per city and field (/in/berlin,
 * /field/design), so that readers and search engines find them from the home,
 * a company's page or a list about a place. Only pages that exist are linked:
 * those in the landing index (indexer/landing.js).
 */
import config from '../src/lib/data/config.json' with { type: 'json' };
import { fieldsOf, landingPath, slugify } from '../src/lib/models/landing.js';
import { escape } from './html.js';
import { placeNames } from './places.js';
import { pageTitle, t } from '../worker/text.js';

/**
 * @typedef {import('../src/lib/models/landing.js').LandingIndex} LandingIndex
 * @typedef {{name: string, path: string, count: number}} PlaceLink
 */

const aliases = /** @type {Record<string, string>} */ (config.landing.cityAliases);

/**
 * A city's page slug from a place's name ("Berlin, Germany", "NYC"), as landing.js names them.
 * @param {string} place
 */
export function citySlug(place) {
	const slug = slugify(place.split(',')[0].trim());
	return aliases[slug] || slug;
}

/** @param {LandingIndex | null} index */
export function placeLinks(index) {
	const cities = new Map((index?.cities || []).map((c) => [c.slug, c]));
	const fields = new Set((index?.fields || []).map((f) => f.slug));

	return {
		/**
		 * The cities with the most jobs, then every field.
		 * @param {number} shown how many cities
		 * @returns {{cities: PlaceLink[], fields: PlaceLink[]}}
		 */
		top(shown) {
			return {
				cities: (index?.cities || []).slice(0, shown).map((c) => ({ name: pageTitle({ city: c.slug }, c.name), path: landingPath({ city: c.slug }), count: c.count })),
				fields: (index?.fields || []).map((f) => ({ name: pageTitle({ field: f.slug }, ''), path: landingPath({ field: f.slug }), count: f.count }))
			};
		},

		/**
		 * The cities and fields of some jobs (a company's), most jobs first.
		 * @param {{t: string, l?: string, d?: string}[]} jobs
		 * @returns {{cities: PlaceLink[], fields: PlaceLink[]}}
		 */
		ofJobs(jobs) {
			/** @type {Map<string, number>} */
			const inCity = new Map();
			/** @type {Map<string, number>} */
			const inField = new Map();
			for (const job of jobs) {
				for (const slug of new Set(placeNames(job.l).map(citySlug))) if (cities.has(slug)) inCity.set(slug, (inCity.get(slug) || 0) + 1);
				for (const slug of fieldsOf(job)) if (fields.has(slug)) inField.set(slug, (inField.get(slug) || 0) + 1);
			}
			const sorted = (/** @type {Map<string, number>} */ m) => [...m].sort((a, b) => b[1] - a[1]);
			return {
				cities: sorted(inCity).map(([slug, count]) => ({ name: pageTitle({ city: slug }, cities.get(slug)?.name || slug), path: landingPath({ city: slug }), count })),
				fields: sorted(inField).map(([slug, count]) => ({ name: pageTitle({ field: slug }, ''), path: landingPath({ field: slug }), count }))
			};
		},

		/**
		 * The pages of the cities a list is about ("Startups in Berlin").
		 * @param {string[]} places
		 * @returns {PlaceLink[]}
		 */
		ofPlaces(places) {
			return [...new Set(places.map(citySlug))]
				.map((slug) => cities.get(slug))
				.filter((c) => c !== undefined)
				.map((c) => ({ name: pageTitle({ city: c.slug }, c.name), path: landingPath({ city: c.slug }), count: c.count }));
		}
	};
}

/**
 * Links as a titled list ('' when there are none).
 * @param {string} title
 * @param {PlaceLink[]} links
 */
export function linkList(title, links) {
	if (!links.length) return '';
	return `<h2>${escape(title)}</h2><ul>${links
		.map((l) => `<li><a href="${escape(l.path)}">${escape(l.name)}</a> (${escape(t('landing.count', { count: l.count }))})</li>`)
		.join('')}</ul>`;
}
