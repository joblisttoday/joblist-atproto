import config from '#lib/data/config.json';

/**
 * MapLibre, loaded on demand (it is large and only map pages need it).
 * @returns {Promise<typeof import('maplibre-gl')>}
 */
export async function loadMapLibre() {
	const [maplibre, { default: workerUrl }] = await Promise.all([
		import('maplibre-gl'),
		import('maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'),
		import('maplibre-gl/dist/maplibre-gl.css')
	]);
	maplibre.setWorkerUrl(workerUrl);
	return maplibre;
}

/**
 * A map shown as a globe when zoomed out, flat when close, in the page's light or dark style.
 * @param {typeof import('maplibre-gl')} maplibre
 * @param {HTMLElement} node
 * @param {Partial<import('maplibre-gl').MapOptions>} [options]
 */
export function createMap(maplibre, node, options = {}) {
	const dark = matchMedia('(prefers-color-scheme: dark)').matches;
	const map = new maplibre.Map({
		container: node,
		style: dark ? config.map.styleDark : config.map.style,
		center: /** @type {[number, number]} */ (config.map.center),
		zoom: config.map.zoom,
		attributionControl: { compact: true },
		...options
	});
	// Zoom buttons for a mouse; fingers pinch.
	if (matchMedia(config.layout.finePointer).matches) map.addControl(new maplibre.NavigationControl({ showCompass: false }));
	map.on('style.load', () => map.setProjection({ type: config.map.projection }));
	return map;
}

/**
 * The page's colors, for map layers.
 * @param {HTMLElement} node
 */
export function cssColors(node) {
	const css = getComputedStyle(node);
	return (/** @type {string} */ name) => css.getPropertyValue(name).trim();
}
