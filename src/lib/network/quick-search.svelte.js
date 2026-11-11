import { offerCount, placeCounts } from '#lib/models/job.js';
import { data } from './network.svelte.js';
import { getSnapshotCounts, getSnapshotJobs } from './snapshot.js';
import { getLandingIndex } from './landing.js';
import config from '#lib/data/config.json';
import { t } from '#lib/i18n/index.svelte.js';

/**
 * What the search box on every page looks through: companies and their tags (already
 * read), and the places jobs name and each company's open offers, from the snapshot's
 * counts once the box is first used (from all its jobs when it has none), and the cities
 * and fields with a page (landing/index.json, small).
 */

/** @type {[string, number][]} */
let places = $state.raw([]);
/** @type {Map<string, number>} */
let counts = $state.raw(new Map());
let index = $state.raw(/** @type {import('#lib/models/landing.js').LandingIndex | null} */ (null));
let asked = false;

export function readSources() {
	if (asked) return;
	asked = true;
	// Without it (offline), the pages are simply not offered.
	getLandingIndex()
		.then((found) => (index = found))
		.catch(() => {});
	getSnapshotCounts().then((file) => {
		if (file) {
			places = file.places.slice(0, config.quickSearch.places);
			counts = file.offers;
			return;
		}
		getSnapshotJobs().then((snapshot) => {
			if (!snapshot) return;
			places = placeCounts(snapshot.all, config.quickSearch.places);
			counts = new Map([...snapshot.jobs].map(([key, list]) => [key, offerCount(list)]));
		});
	});
}

const companies = $derived([...data.companies.values()]);
const cities = $derived((index?.cities || []).map((c) => ({ slug: c.slug, name: c.name, count: c.count })));
// Fields by their name in the language read.
const fields = $derived((index?.fields || []).map((f) => ({ slug: f.slug, name: t(`field.${f.slug}`), count: f.count })));

export const sources = {
	get companies() {
		return companies;
	},
	get places() {
		return places;
	},
	get counts() {
		return counts;
	},
	get cities() {
		return cities;
	},
	get fields() {
		return fields;
	},
	aliases: config.landing.cityAliases
};
