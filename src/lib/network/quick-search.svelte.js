import { placeCounts } from '#lib/models/job.js';
import { data } from './network.svelte.js';
import { getSnapshotJobs } from './snapshot.js';
import config from '#lib/data/config.json';

/**
 * What the search box on every page looks through: companies and lists (already
 * read), and the places jobs name and each company's open jobs, from the snapshot
 * once the box is first used.
 */

/** @type {[string, number][]} */
let places = $state.raw([]);
/** @type {Map<string, number>} */
let counts = $state.raw(new Map());
let asked = false;

export function readSources() {
	if (asked) return;
	asked = true;
	getSnapshotJobs().then((snapshot) => {
		if (!snapshot) return;
		const jobs = [...snapshot.jobs.values()].flat();
		places = placeCounts(jobs, config.quickSearch.places);
		counts = new Map([...snapshot.jobs].map(([key, list]) => [key, list.length]));
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
