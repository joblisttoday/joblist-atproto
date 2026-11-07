import { getSnapshotJobs } from './snapshot.js';
import { membersOf } from './network.svelte.js';
import { offerCount } from '#lib/models/job.js';
import { listStats } from '#lib/models/list-filters.js';
import { listPlace, offersIn } from '#lib/models/list-place.js';

/**
 * How many jobs each company has open, as of the last snapshot; read once, when first asked.
 * Counted as offers, as pages show them: the same offer in several places is one (see offerCount).
 * Empty while it loads, or without a snapshot.
 */

/** @type {Map<string, import('#lib/ats/job.js').Job[]>} */
let jobs = $state.raw(new Map());
/** @type {Map<string, number>} */
let counts = $state.raw(new Map());
let asked = false;

function ask() {
	if (asked) return;
	asked = true;
	getSnapshotJobs().then((snapshot) => {
		if (!snapshot) return;
		jobs = snapshot.jobs;
		counts = new Map([...snapshot.jobs].map(([key, list]) => [key, offerCount(list)]));
	});
}

/** Open offers by company key. */
export function jobCounts() {
	ask();
	return counts;
}

/** @type {import('#lib/ats/job.js').Job[]} */
const none = [];

/**
 * A list's companies, those hiring and their open offers: in its place when it is about one
 * (see listPlace), as its page shows them first. Each company's count is made once per snapshot.
 * @param {import('#lib/models/list.js').List} list
 */
export function listJobStats(list) {
	ask();
	const keys = membersOf(list).members.map((m) => m.key);
	const place = listPlace(list);
	if (!place) return listStats(keys, counts);
	const here = listStats(keys, new Map(keys.map((key) => [key, offersIn(jobs.get(key) || none, place.places)])));
	// Nothing there: its jobs everywhere, as its page then shows them.
	return here.jobs ? here : listStats(keys, counts);
}

/**
 * A list's open jobs in its place only (null for a list about no place).
 * @param {import('#lib/models/list.js').List} list
 */
export function listJobStatsHere(list) {
	ask();
	const place = listPlace(list);
	if (!place) return null;
	const keys = membersOf(list).members.map((m) => m.key);
	return listStats(keys, new Map(keys.map((key) => [key, offersIn(jobs.get(key) || none, place.places)])));
}

/**
 * A list's open jobs wherever they are, even for a list about a place.
 * @param {import('#lib/models/list.js').List} list
 */
export function listJobStatsEverywhere(list) {
	ask();
	return listStats(membersOf(list).members.map((m) => m.key), counts);
}
