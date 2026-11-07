import places from '#lib/data/places.json' with { type: 'json' };
import { filterJobs, offerCount } from './job.js';
import { canonical } from './place.js';

/**
 * The place a list is about, when its name says it clearly: "Berlin", "Paris & Lyon",
 * "Startups in Munich". Its name is only places (and words joining them), or ends with
 * "in" and only places. Anything else is about something other than a place
 * ("Robotics", "Remote first", "Building on atproto"), even if a place is in it.
 * @typedef {import('./list.js').List} List
 * @typedef {import('#lib/ats/job.js').Job} Job
 * @typedef {{name: string, places: string[]}} ListPlace
 *   name: as the list writes it ("Paris & Lyon"); places: each place in it.
 */

/** Every place joblist knows, in one spelling: cities, countries, regions. */
const known = new Set(
	[
		...Object.entries(places.cities).flat(2),
		...Object.entries(places.countries).flat(2),
		...Object.keys(places.regions),
		...places.same.flat()
	].map((name) => canonical(name).trim())
);

/** Words joining places: "Paris & Lyon", "Berlin, Munich", "Paris et Lyon". */
const joins = /\s*(?:[,&+/]|\s(?:and|et|und)\s)\s*/i;
/** What comes before a place: "Startups in Berlin", "Jeunes pousses à Paris". */
const before = /^.+\s(?:in|à|en|au)\s+(.+)$/i;

/**
 * The places a text names when it is only places, else none.
 * @param {string} text
 * @returns {string[]}
 */
function onlyPlaces(text) {
	const parts = text.split(joins).map((p) => p.trim());
	if (!parts.length || parts.some((p) => !p || !known.has(canonical(p).trim()))) return [];
	return parts;
}

/** @type {Map<string, ListPlace | null>} */
const read = new Map();

/**
 * @param {Pick<List, 'name'>} list
 * @returns {ListPlace | null}
 */
export function listPlace({ name }) {
	const text = (name || '').trim();
	let found = read.get(text);
	if (found !== undefined) return found;
	found = null;
	const tail = before.exec(text)?.[1].trim();
	for (const candidate of [text, tail]) {
		const parts = candidate ? onlyPlaces(candidate) : [];
		if (parts.length) {
			found = { name: candidate || '', places: parts };
			break;
		}
	}
	read.set(text, found);
	return found;
}

/** Offers counted, by jobs and places: each company's jobs are counted once per snapshot. @type {WeakMap<Job[], Map<string, number>>} */
const counted = new WeakMap();

/**
 * How many offers some jobs have in some places (see offerCount), all of them without places.
 * @param {Job[]} jobs
 * @param {string[] | undefined} where
 */
export function offersIn(jobs, where) {
	const key = (where || []).join('\n');
	let byPlace = counted.get(jobs);
	if (!byPlace) counted.set(jobs, (byPlace = new Map()));
	let count = byPlace.get(key);
	if (count === undefined) {
		const found = where?.length ? filterJobs(jobs, { query: '', where: '', remote: '', places: where }, new Map()) : jobs;
		count = offerCount(found);
		byPlace.set(key, count);
	}
	return count;
}
