/**
 * Where a company's office is in a place a job names: "idealo, Berlin" is an office
 * in OpenStreetMap, more precise than the middle of Berlin. Looked up once, kept in
 * the offices cache (published with the snapshot) like places.json.
 */
import config from '../src/lib/data/config.json' with { type: 'json' };
import { distanceKm } from '../src/lib/models/distance.js';
import { Refused } from './nominatim.js';
import { placeKey } from './places.js';

/**
 * @typedef {import('./places.js').Found} Found
 * @typedef {import('./places.js').PlaceCache} PlaceCache
 */

const { geocode: settings } = config;

/**
 * The key of a company's office in a place.
 * @param {string} company the company's name
 * @param {string} place a place a job names
 */
export function officeKey(company, place) {
	return placeKey(`${company}|${place}`);
}

/**
 * Look up the offices not in the cache yet, the most named first, at most `budget` of them.
 * An answer counts only when it is an office near the place itself.
 * @param {string[]} keys officeKey() of each job, repeated as often as it is
 * @param {PlaceCache} offices updated in place
 * @param {PlaceCache} places where the places are, to check the answers
 * @param {{budget?: number, delay?: number, lookup?: (query: string) => Promise<{point: [number, number], category: string} | null>}} [options]
 */
export async function findOffices(keys, offices, places, { budget = settings.officeBudget, delay = settings.delayMs, lookup = nominatim } = {}) {
	/** @type {Map<string, number>} */
	const counts = new Map();
	for (const key of keys) if (!(key in offices) && places[key.split('|')[1]]) counts.set(key, (counts.get(key) || 0) + 1);
	const missing = [...counts].sort((a, b) => b[1] - a[1]).slice(0, budget).map(([key]) => key);
	for (const [i, key] of missing.entries()) {
		if (i) await new Promise((resolve) => setTimeout(resolve, delay));
		const [company, place] = key.split('|');
		try {
			const hit = await lookup(`${company}, ${place}`);
			const near = /** @type {[number, number]} */ (places[place]);
			offices[key] =
				hit && settings.officeCategories.includes(hit.category) && distanceKm(hit.point, near) <= settings.officeMaxKm ? hit.point : 0;
		} catch (error) {
			// Asked to slow down: stop for this run. Otherwise unanswered: tried again next run.
			if (error instanceof Refused) return i;
		}
	}
	return missing.length;
}

/** @param {string} query */
async function nominatim(query) {
	const url = `${settings.service}?${new URLSearchParams({ q: query, format: 'jsonv2', limit: '1' })}`;
	const res = await fetch(url, { headers: { 'user-agent': config.userAgent, 'accept-language': 'en' } });
	if (res.status === 429 || res.status === 403) throw new Refused(`${res.status}`);
	if (!res.ok) throw new Error(`${res.status}`);
	const [hit] = await res.json();
	if (!hit) return null;
	const round = (/** @type {number} */ n) => Math.round(n * 1e4) / 1e4;
	return { point: /** @type {[number, number]} */ ([round(Number(hit.lon)), round(Number(hit.lat))]), category: String(hit.category) };
}
