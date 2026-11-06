import { allNewCount } from '#lib/models/saved-search.js';
import { data } from './network.svelte.js';
import { searches } from './saved-searches.svelte.js';
import { getSnapshotJobs } from './snapshot.js';

/**
 * The jobs saved searches are counted on, outside the explorer: those of the
 * snapshot (read by every page anyway) and those posted here.
 * @typedef {import('#lib/ats/job.js').Job} Job
 */

/** @type {Job[]} */
let board = $state.raw([]);
let asked = false;
function read() {
	if (asked) return;
	asked = true;
	getSnapshotJobs().then((snapshot) => {
		if (snapshot) board = [...snapshot.jobs.values()].flat();
	});
}

const names = $derived(new Map([...data.companies.values()].map((c) => [c.key, c.name])));
const jobs = $derived(board.length ? [...[...data.postedJobs.values()].flat(), ...board] : []);
const fresh = $derived(jobs.length && searches.list.length ? allNewCount(searches.list, jobs, names) : 0);

export const savedJobs = {
	/** Every job known; empty while they are read. */
	get jobs() {
		read();
		return jobs;
	},
	get names() {
		return names;
	},
	/** The new jobs of all saved searches, each once. */
	get fresh() {
		if (searches.list.length) read();
		return fresh;
	}
};
