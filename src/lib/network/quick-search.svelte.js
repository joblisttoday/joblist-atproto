import { offerCount, placeCounts } from '#lib/models/job.js';
import { data } from './network.svelte.js';
import { getSnapshotCounts, getSnapshotJobs } from './snapshot.js';
import config from '#lib/data/config.json';

/**
 * What the search box on every page looks through: companies and lists (already
 * read), and the places jobs name and each company's open offers, from the snapshot's
 * counts once the box is first used (from all its jobs when it has none).
 */

/** @type {[string, number][]} */
let places = $state.raw([]);
/** @type {Map<string, number>} */
let counts = $state.raw(new Map());
let asked = false;

export function readSources() {
	if (asked) return;
	asked = true;
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

export const sources = {
	get companies() {
		return companies;
	},
	get lists() {
		return data.lists;
	},
	get places() {
		return places;
	},
	get counts() {
		return counts;
	}
};
