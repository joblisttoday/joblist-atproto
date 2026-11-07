import { getSnapshotJobs } from './snapshot.js';

/**
 * How many jobs each company has open, as of the last snapshot; read once, when first asked.
 * Empty while it loads, or without a snapshot.
 */

/** @type {Map<string, number>} */
let counts = $state.raw(new Map());
let asked = false;

/** Open jobs by company key. */
export function jobCounts() {
	if (!asked) {
		asked = true;
		getSnapshotJobs().then((snapshot) => {
			if (snapshot) counts = new Map([...snapshot.jobs].map(([key, jobs]) => [key, jobs.length]));
		});
	}
	return counts;
}
