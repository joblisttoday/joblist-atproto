/**
 * Asking OpenStreetMap Nominatim where a place a job names is, and judging its answer.
 * Only settlements are asked for (cities, towns, districts): a street or a shop
 * named like the place would be a wrong point, and a country is too wide to measure from.
 */
import config from '../src/lib/data/config.json' with { type: 'json' };

const { geocode: settings } = config;

/**
 * @typedef {{lon: string, lat: string, addresstype: string, display_name: string,
 *   boundingbox?: string[], address?: Record<string, string>}} Hit
 */

/** Lower case, without accents. @param {string} s */
const fold = (s) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim();

/**
 * Whether an answer is the place named: not a region (unless that region is a city, like Tokyo),
 * and in what the name ends with ("Portland, Maine": in Maine; "San Francisco, Seattle": nowhere).
 * @param {string} name
 * @param {Hit | undefined} hit
 */
export function accept(name, hit) {
	if (!hit || tooWide(hit)) return false;
	const region = hit.address?.['ISO3166-2-lvl4'] || '';
	const parts = name.split(',');
	if (parts.length < 2) return true;
	const qualifier = fold(parts[parts.length - 1]);
	const country = hit.address?.country_code || '';
	return (
		fold(hit.display_name).includes(qualifier) ||
		qualifier === country ||
		qualifier === fold(region.split('-')[1] || '') ||
		/** @type {Record<string, string>} */ (settings.countryAliases)[qualifier] === country
	);
}

/**
 * A region, too wide to measure a distance from, unless it is a city (Tokyo is a prefecture).
 * @param {Hit} hit
 */
export function tooWide(hit) {
	return settings.tooWide.includes(hit.addresstype) && !settings.cityRegions.includes(hit.address?.['ISO3166-2-lvl4'] || '');
}

/**
 * Whether a hit lies in another's bounding box ([south, north, west, east]).
 * @param {Hit} hit
 * @param {Hit} area
 */
export function inside(hit, area) {
	const [south, north, west, east] = (area.boundingbox || []).map(Number);
	const [lon, lat] = [Number(hit.lon), Number(hit.lat)];
	return lat >= south && lat <= north && lon >= west && lon <= east;
}

/** Thrown when Nominatim asks us to slow down or stop: the run stops asking. */
export class Refused extends Error {}

/**
 * @param {string} name
 * @param {'settlement' | 'city'} [featureType]
 * @returns {Promise<Hit | undefined>}
 */
export async function search(name, featureType = 'settlement') {
	const query = { q: name, format: 'jsonv2', limit: '1', addressdetails: '1', featureType };
	const res = await fetch(`${settings.service}?${new URLSearchParams(query)}`, {
		headers: { 'user-agent': config.userAgent, 'accept-language': 'en' }
	});
	if (res.status === 429 || res.status === 403) throw new Refused(`${res.status}`);
	if (!res.ok) throw new Error(`${res.status}`);
	const [hit] = await res.json();
	return hit;
}
