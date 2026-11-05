import config from '#lib/data/config.json';
import { createMap, cssColors, loadMapLibre } from './maplibre.js';

/**
 * @typedef {{lat: number, lon: number, company: {key: string, name: string}}} Point
 */

/**
 * Where most locations are: drops the outer 10% on each side,
 * so a city list is not zoomed out by a few offices elsewhere.
 * @param {{lat: number, lon: number}[]} list
 * @returns {[[number, number], [number, number]]}
 */
export function mainArea(list) {
	const lats = list.map((p) => p.lat).sort((a, b) => a - b);
	const lons = list.map((p) => p.lon).sort((a, b) => a - b);
	const cut = list.length >= 10 ? Math.floor(list.length * 0.1) : 0;
	const last = list.length - 1 - cut;
	return [
		[lons[cut], lats[cut]],
		[lons[last], lats[last]]
	];
}

/**
 * Companies as one GL circle layer (fast with thousands of points),
 * colored from the page's CSS variables. Loads MapLibre on demand.
 * @param {HTMLElement} node
 * @param {Point[]} points
 * @returns {() => void} cleanup
 */
export function mountMap(node, points) {
	/** @type {import('maplibre-gl').Map | undefined} */
	let map;
	let removed = false;
	const color = cssColors(node);

	(async () => {
		const maplibre = await loadMapLibre();
		if (removed) return;
		map = createMap(maplibre, node);
		map.fitBounds(mainArea(points), { padding: config.map.padding, maxZoom: config.map.maxZoom, animate: false });
		const instance = map;
		instance.on('load', () => {
			// The stylesheet may arrive after the map measured its box.
			instance.resize();
			instance.addSource('companies', {
				type: 'geojson',
				data: {
					type: 'FeatureCollection',
					features: points.map((p) => ({
						type: 'Feature',
						geometry: { type: 'Point', coordinates: [p.lon, p.lat] },
						properties: { key: p.company.key, name: p.company.name }
					}))
				}
			});
			instance.addLayer({
				id: 'companies',
				type: 'circle',
				source: 'companies',
				paint: {
					'circle-radius': config.map.pointRadius,
					'circle-color': color('--color-fg'),
					'circle-stroke-width': config.map.pointStroke,
					'circle-stroke-color': color('--color-bg')
				}
			});
			instance.on('click', 'companies', (event) => {
				const features = event.features || [];
				const list = document.createElement('ul');
				const seen = new Set();
				for (const feature of features) {
					const { key, name } = feature.properties;
					if (seen.has(key) || seen.size >= config.map.popupMax) continue;
					seen.add(key);
					const link = document.createElement('a');
					link.href = `/company/${key}`;
					link.textContent = name;
					const item = document.createElement('li');
					item.append(link);
					list.append(item);
				}
				new maplibre.Popup({ closeButton: false }).setLngLat(event.lngLat).setDOMContent(list).addTo(instance);
			});
			instance.on('mouseenter', 'companies', () => (instance.getCanvas().style.cursor = 'pointer'));
			instance.on('mouseleave', 'companies', () => (instance.getCanvas().style.cursor = ''));
		});
	})();

	return () => {
		removed = true;
		map?.remove();
	};
}
