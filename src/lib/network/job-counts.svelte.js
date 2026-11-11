import { getSnapshotCounts, getSnapshotJobs } from './snapshot.js';
import { offerCount } from '#lib/models/job.js';

/**
 * How many jobs each company has open, as of the last snapshot; read once, when first asked.
 * Counted as offers, as pages show them: the same offer in several places is one (see offerCount).
 * Read from the small counts file; all the jobs are read only without it. Empty while it
 * loads, or without a snapshot.
 */

/** @type {Map<string, number>} */
let counts = $state.raw(new Map());
let asked = false;

function ask() {
	if (asked) return;
	asked = true;
	getSnapshotCounts().then((file) => {
		if (file) counts = file.offers;
		else
			getSnapshotJobs().then((snapshot) => {
				if (snapshot && !counts.size) counts = new Map([...snapshot.jobs].map(([key, list]) => [key, offerCount(list)]));
			});
	});
}

/** Open offers by company key. */
export function jobCounts() {
	ask();
	return counts;
}
