/**
 * Places found by name as someone types (Photon, an OpenStreetMap search made
 * for it), as the locations records keep: name, country and where it is.
 * @typedef {import('./company.js').Location} Location
 * @typedef {{label: string, location: Location}} FoundPlace
 *   label: the name with what tells it from others of the same name.
 */

/** Coordinates as records keep them: decimal degrees in a string, to about a metre. @param {number} value */
const degrees = (value) => String(Math.round(value * 1e5) / 1e5);

/**
 * @param {any} feature a GeoJSON feature from Photon
 * @returns {FoundPlace | null}
 */
export function toFoundPlace(feature) {
	const p = feature?.properties || {};
	const [lon, lat] = feature?.geometry?.coordinates || [];
	if (!p.name || !Number.isFinite(lon) || !Number.isFinite(lat)) return null;
	const region = p.state && p.state !== p.name ? p.state : '';
	return {
		label: [p.name, region, p.country].filter(Boolean).join(', '),
		location: { name: String(p.name), country: p.country ? String(p.country) : undefined, latitude: degrees(lat), longitude: degrees(lon) }
	};
}

/**
 * A location as one line: "Berlin, Germany".
 * @param {Location} location
 */
export function locationLabel(location) {
	return [location.name, location.country].filter(Boolean).join(', ');
}

/**
 * Whether two locations are the same place (by name and country).
 * @param {Location} a
 * @param {Location} b
 */
export function samePlace(a, b) {
	const key = (/** @type {Location} */ l) => locationLabel(l).trim().toLowerCase();
	return key(a) !== '' && key(a) === key(b);
}

/**
 * Found places, each name once: a city and its district or county often have the
 * same one ("Paris, Île-de-France, France" twice); the first, the closest match, is kept.
 * @param {(FoundPlace | null)[]} found
 * @returns {FoundPlace[]}
 */
export function uniquePlaces(found) {
	const seen = new Set();
	return /** @type {FoundPlace[]} */ (found.filter((place) => place && !seen.has(place.label) && seen.add(place.label)));
}
