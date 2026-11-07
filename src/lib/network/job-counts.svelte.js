import { getSnapshotCounts, getSnapshotJobs } from './snapshot.js';
import { membersOf } from './network.svelte.js';
import { offerCount } from '#lib/models/job.js';
import { listStats } from '#lib/models/list-filters.js';
import { listPlace, offersIn } from '#lib/models/list-place.js';
import { placesKey } from '#lib/models/snapshot-counts.js';

/**
 * How many jobs each company has open, as of the last snapshot; read once, when first asked.
 * Counted as offers, as pages show them: the same offer in several places is one (see offerCount).
 * Read from the small counts file; all the jobs are read only without it, or for a list
 * about a place no list was about at the last snapshot. Empty while it loads, or without a snapshot.
 */

/** @type {Map<string, number>} */
let counts = $state.raw(new Map());
/** Offers in the places lists are about, by placesKey. @type {Map<string, Map<string, number>>} */
let here = $state.raw(new Map());
/** Every job by company, only once needed. @type {Map<string, import('#lib/ats/job.js').Job[]>} */
let jobs = $state.raw(new Map());
/** The counts file was read (or is missing). */
let read = $state(false);
let asked = false;
let jobsAsked = false;

function ask() {
	if (asked) return;
	asked = true;
	getSnapshotCounts().then((file) => {
		if (file) {
			counts = file.offers;
			here = file.here;
		} else readJobs();
		read = true;
	});
}

function readJobs() {
	if (jobsAsked) return;
	jobsAsked = true;
	getSnapshotJobs().then((snapshot) => {
		if (!snapshot) return;
		jobs = snapshot.jobs;
		if (!counts.size) counts = new Map([...snapshot.jobs].map(([key, list]) => [key, offerCount(list)]));
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
 * Some companies' offers in some places: counted by the indexer, else from all the jobs.
 * @param {string[]} keys
 * @param {string[]} places
 */
function offersHere(keys, places) {
	const counted = here.get(placesKey(places));
	if (counted) return new Map(keys.map((key) => [key, counted.get(key) || 0]));
	// A place no list was about at the last snapshot (a list made since): its jobs are read.
	if (read) readJobs();
	return new Map(keys.map((key) => [key, offersIn(jobs.get(key) || none, places)]));
}

/**
 * A list's companies, those hiring and their open offers: in its place when it is about one
 * (see listPlace), as its page shows them first.
 * @param {import('#lib/models/list.js').List} list
 */
export function listJobStats(list) {
	ask();
	const keys = membersOf(list).members.map((m) => m.key);
	const place = listPlace(list);
	if (!place) return listStats(keys, counts);
	const inPlace = listStats(keys, offersHere(keys, place.places));
	// Nothing there: its jobs everywhere, as its page then shows them.
	return inPlace.jobs ? inPlace : listStats(keys, counts);
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
	return listStats(keys, offersHere(keys, place.places));
}

/**
 * A list's open jobs wherever they are, even for a list about a place.
 * @param {import('#lib/models/list.js').List} list
 */
export function listJobStatsEverywhere(list) {
	ask();
	return listStats(membersOf(list).members.map((m) => m.key), counts);
}
