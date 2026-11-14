import config from '#lib/data/config.json' with { type: 'json' };

/**
 * Places, as records keep them (today.joblist.company#location): a name, an address, a
 * country, and where it is (decimal degrees, as strings). Found by name as someone types
 * (Photon, an OpenStreetMap search made for it).
 * @typedef {{name?: string, address?: string, country?: string, countryCode?: string, latitude?: string, longitude?: string}} Location
 * @typedef {{label: string, location: Location}} FoundPlace
 *   label: the name with what tells it from others of the same name.
 */

/** Coordinates as records keep them: decimal degrees in a string, to about a metre. @param {number} value */
const degrees = (value) => String(Math.round(value * 1e5) / 1e5);

/** A text field of a place, as the lexicon allows it. @param {unknown} value @param {number} max */
const text = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

/**
 * A place as written by anyone, made safe to show and to write back: only its known
 * fields, each as long as the lexicon allows, coordinates only when they are numbers on the
 * Earth. Null when nothing is left.
 * @param {unknown} value
 * @returns {Location | null}
 */
export function toLocation(value) {
	if (!value || typeof value !== 'object') return null;
	const v = /** @type {Record<string, unknown>} */ (value);
	/** @type {Location} */
	const place = {};
	const name = text(v.name, 100);
	const address = text(v.address, 200);
	const country = text(v.country, 100);
	const code = text(v.countryCode, 2).toUpperCase();
	if (name) place.name = name;
	if (address) place.address = address;
	if (country) place.country = country;
	if (/^[A-Z]{2}$/.test(code)) place.countryCode = code;
	const lat = Number(v.latitude);
	const lon = Number(v.longitude);
	if (v.latitude !== '' && v.longitude !== '' && Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
		place.latitude = degrees(lat);
		place.longitude = degrees(lon);
	}
	return place.name || place.address || place.country || place.latitude ? place : null;
}

/** Places as written by anyone, the safe ones (toLocation), at most `max`. @param {unknown} list @param {number} [max] */
export const toLocations = (list, max = 50) => (Array.isArray(list) ? list.map(toLocation).filter((l) => l !== null).slice(0, max) : []);

/** A place as one line: "Berlin, Germany". @param {Location} location */
export const locationLabel = (location) => [location.name || location.address, location.country].filter(Boolean).join(', ');

/** Whether two places are the same (by name and country). @param {Location} a @param {Location} b */
export function samePlace(a, b) {
	const key = (/** @type {Location} */ l) => locationLabel(l).trim().toLowerCase();
	return key(a) !== '' && key(a) === key(b);
}

/**
 * The places that say where they are, as numbers, for a map.
 * @param {Location[]} locations
 * @returns {{lat: number, lon: number, label: string}[]}
 */
export const locationPoints = (locations) =>
	locations.filter((l) => l.latitude && l.longitude).map((l) => ({ lat: Number(l.latitude), lon: Number(l.longitude), label: locationLabel(l) }));

/**
 * A place Photon found (a GeoJSON feature), as records keep it.
 * @param {any} feature
 * @returns {FoundPlace | null}
 */
export function toFoundPlace(feature) {
	const p = feature?.properties || {};
	const [lon, lat] = feature?.geometry?.coordinates || [];
	if (!p.name || !Number.isFinite(lon) || !Number.isFinite(lat)) return null;
	const region = p.state && p.state !== p.name ? p.state : '';
	/** @type {Location} */
	const location = { name: String(p.name), latitude: degrees(lat), longitude: degrees(lon) };
	if (p.country) location.country = String(p.country);
	if (/^[A-Za-z]{2}$/.test(p.countrycode || '')) location.countryCode = String(p.countrycode).toUpperCase();
	return { label: [p.name, region, p.country].filter(Boolean).join(', '), location };
}

/**
 * Found places, each name once: a city and its district often share it; the first, the
 * closest match, is kept.
 * @param {(FoundPlace | null)[]} found
 * @returns {FoundPlace[]}
 */
export function uniquePlaces(found) {
	const seen = new Set();
	return /** @type {FoundPlace[]} */ (found.filter((place) => place && !seen.has(place.label) && seen.add(place.label)));
}

/**
 * Cities and places whose name starts as typed, in the reader's language (OpenStreetMap,
 * through Photon).
 * @param {string} query
 * @param {string} lang
 * @param {AbortSignal} [signal]
 * @returns {Promise<FoundPlace[]>}
 */
export async function searchPlaces(query, lang, signal) {
	const url = new URL(config.services.placeSearch);
	url.searchParams.set('q', query);
	url.searchParams.set('limit', String(config.placeSearch.limit));
	if (config.placeSearch.languages.includes(lang)) url.searchParams.set('lang', lang);
	for (const layer of config.placeSearch.layers) url.searchParams.append('layer', layer);
	const res = await fetch(url, { signal });
	if (!res.ok) return [];
	const { features = [] } = await res.json();
	return uniquePlaces(features.map(toFoundPlace));
}
