/**
 * Where jobs are, as coordinates: each place a job board names ("Berlin, Germany")
 * is looked up once with OpenStreetMap Nominatim, then kept in the places cache
 * (published with the snapshot), so later runs only look up new places.
 */
import config from '../src/lib/data/config.json' with { type: 'json' };
import { mapPoints } from '../src/lib/models/company.js';
import { Refused, accept, inside, search, tooWide } from './nominatim.js';

/**
 * @typedef {import('../src/lib/models/company.js').Company} Company
 * @typedef {[number, number] | 0} Found [longitude, latitude], or 0 when nothing was found
 * @typedef {Record<string, Found>} PlaceCache by placeKey()
 */

const { geocode: settings } = config;
const workWords = new RegExp(`\\b(${[...config.jobs.remoteWords, ...settings.ignoreWords].join('|')})\\b`, 'gi');

/**
 * The places a job location names: "Berlin, Germany | Remote (EMEA)" → ["Berlin, Germany"].
 * @param {string | undefined} location
 */
export function placeNames(location) {
	return (location || '')
		.split(/\s*(?:\||;|\s\/\s|\s+or\s+)\s*/i)
		.map((part) =>
			part
				.replace(/\([^)]*\)/g, ' ')
				.replace(workWords, ' ')
				.replace(/\s*[-–]\s*$|^\s*[-–]\s*/g, '')
				.replace(/\s+/g, ' ')
				.replace(/ ,/g, ',')
				.replace(/^[\s,]+|[\s,]+$/g, '')
		)
		.filter((part) => /\p{L}{2}/u.test(part));
}

/** @param {string} name */
export function placeKey(name) {
	return name.toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Look up the places not in the cache yet, the most named first,
 * at most `budget` of them, one per `delay`.
 * @param {string[]} names every place named, repeated as often as it is
 * @param {PlaceCache} cache updated in place
 * @param {{budget?: number, delay?: number, lookup?: (name: string) => Promise<Found>}} [options]
 */
export async function geocode(names, cache, { budget = settings.budget, delay = settings.delayMs, lookup = nominatim } = {}) {
	/** @type {Map<string, number>} */
	const counts = new Map();
	for (const key of names.map(placeKey)) if (!(key in cache)) counts.set(key, (counts.get(key) || 0) + 1);
	const missing = [...counts].sort((a, b) => b[1] - a[1]).slice(0, budget).map(([key]) => key);
	for (const [i, key] of missing.entries()) {
		if (i) await new Promise((resolve) => setTimeout(resolve, delay));
		try {
			cache[key] = await lookup(key);
		} catch (error) {
			// Asked to slow down: stop for this run. Otherwise unanswered: tried again next run.
			if (error instanceof Refused) return i;
		}
	}
	return missing.length;
}

/**
 * @param {string} name
 * @returns {Promise<Found>}
 */
async function nominatim(name) {
	let hit = await search(name);
	// A region named like a city (Bristol, the county): the city of that name in it.
	if (hit && tooWide(hit)) {
		const region = hit;
		await new Promise((resolve) => setTimeout(resolve, settings.delayMs));
		const city = await search(name, 'city');
		hit = city && inside(city, region) ? city : undefined;
	}
	return hit && accept(name, hit) ? [round(Number(hit.lon)), round(Number(hit.lat))] : 0;
}

/** @param {number} n about 10 m */
const round = (n) => Math.round(n * 1e4) / 1e4;

/**
 * Where a job is: its company's office found in its place (offices.js), else the company's
 * office named like the place, else the place itself; without a place, the company's only office.
 * @param {string | undefined} location
 * @param {Company | undefined} company
 * @param {PlaceCache} cache places
 * @param {PlaceCache} [found] offices found by offices.js, by officeKey()
 * @returns {[number, number] | undefined}
 */
export function locate(location, company, cache, found = {}) {
	const names = placeNames(location);
	const offices = company ? mapPoints(company) : [];
	for (const name of names) {
		const office = company && found[placeKey(`${company.name}|${name}`)];
		if (office) return office;
	}
	for (const name of names) {
		const office = offices.find((o) => o.name && placeKey(o.name) === placeKey(name.split(',')[0]));
		if (office) return [round(office.lon), round(office.lat)];
		const found = cache[placeKey(name)];
		if (found) return found;
	}
	if (offices.length === 1 && !names.length) return [round(offices[0].lon), round(offices[0].lat)];
	return undefined;
}
