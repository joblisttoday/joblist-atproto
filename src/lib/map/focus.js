import { distanceKm } from '#lib/models/distance.js';

/**
 * Where most of some jobs are, when most are in one city: "design, Berlin" frames Berlin,
 * even though jobs naming Berlin and New York also sit in New York.
 * Points are grouped in grid cells; the fullest cell's middle is the city.
 * @param {[number, number][]} points [longitude, latitude]
 * @param {{cellDeg: number, km: number, share: number}} settings
 *   cellDeg: grid size; km: how far from the middle counts as the city; share: the part of the jobs it must hold.
 * @returns {[[number, number], [number, number]] | null} its bounds, or null when the jobs are spread
 */
export function focusArea(points, { cellDeg, km, share }) {
	if (!points.length) return null;
	/** @type {Map<string, [number, number][]>} */
	const cells = new Map();
	for (const p of points) {
		const key = `${Math.round(p[0] / cellDeg)}|${Math.round(p[1] / cellDeg)}`;
		cells.set(key, [...(cells.get(key) || []), p]);
	}
	const fullest = [...cells.values()].reduce((a, b) => (b.length > a.length ? b : a));
	const middle = /** @type {[number, number]} */ ([0, 1].map((i) => fullest.reduce((sum, p) => sum + p[i], 0) / fullest.length));
	const near = points.filter((p) => distanceKm(middle, p) <= km);
	if (near.length < share * points.length) return null;
	const lons = near.map((p) => p[0]);
	const lats = near.map((p) => p[1]);
	return [
		[Math.min(...lons), Math.min(...lats)],
		[Math.max(...lons), Math.max(...lats)]
	];
}
