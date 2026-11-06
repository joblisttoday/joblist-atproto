import config from '#lib/data/config.json' with { type: 'json' };

/**
 * @typedef {[number, number]} Point [longitude, latitude]
 * @typedef {keyof typeof config.travel.kmPerHour} TravelMode
 */

const EARTH_KM = 6371;
const rad = (/** @type {number} */ deg) => (deg * Math.PI) / 180;

/**
 * Straight-line distance between two points, in km.
 * @param {Point} a
 * @param {Point} b
 */
export function distanceKm([lon1, lat1], [lon2, lat2]) {
	const h = Math.sin(rad(lat2 - lat1) / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lon2 - lon1) / 2) ** 2;
	return 2 * EARTH_KM * Math.asin(Math.sqrt(h));
}

/**
 * About how long the trip takes: the straight line, lengthened for streets, at the mode's usual speed.
 * @param {number} km straight-line distance
 * @param {TravelMode} [mode]
 */
export function travelMinutes(km, mode = /** @type {TravelMode} */ (config.travel.mode)) {
	return Math.round(((km * config.travel.detour) / config.travel.kmPerHour[mode]) * 60);
}

/**
 * Whether a point is in an area, also one across the date line (west east of east).
 * @param {[number, number]} point [longitude, latitude]
 * @param {[[number, number], [number, number]]} area [[west, south], [east, north]]
 */
export function inArea([lon, lat], [[west, south], [east, north]]) {
	if (lat < south || lat > north) return false;
	return west <= east ? lon >= west && lon <= east : lon >= west || lon <= east;
}
