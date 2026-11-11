import { allNewCount } from '#lib/models/saved-search.js';
import { mergeJobs } from '#lib/models/job-post.js';
import { data } from './network.svelte.js';
import { keptJobs } from './kept-jobs.svelte.js';
import { searches } from './saved-searches.svelte.js';

/**
 * The jobs saved searches are counted on: those of the saved organizations (read live from
 * their boards, kept-jobs.svelte.js), and the offers posted on atproto this browser has read.
 * @typedef {import('#lib/ats/job.js').Job} Job
 */

const names = $derived(new Map(keptJobs.companies.map((c) => [c.key, c.name])));
const jobs = $derived(mergeJobs([...data.postedJobs.values()].flat(), keptJobs.all));
const fresh = $derived(jobs.length && searches.list.length ? allNewCount(searches.list, jobs, names) : 0);

export const savedJobs = {
	/** Every job known; empty while they are read. */
	get jobs() {
		return jobs;
	},
	get names() {
		return names;
	},
	/** The new jobs of all saved searches, each once. */
	get fresh() {
		return searches.list.length ? fresh : 0;
	}
};
