import config from '#lib/data/config.json';
import { createMap, cssColors, loadMapLibre } from './maplibre.js';

/**
 * @typedef {{lat: number, lon: number, company: {key: string, name: string}, href?: string}} Point
 *   href: where a tap on it leads (a company's page by default; a city's, on /in)
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
 * Companies as GL circles (fast with thousands of points), grouped where they are many:
 * a group says how many and opens closer on a tap, as the jobs map does (Berlin alone has
 * hundreds). Colored from the page's CSS variables. Loads MapLibre on demand.
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
						properties: { key: p.company.key, name: p.company.name, href: p.href || `/${p.company.key}` }
					}))
				},
				cluster: true,
				clusterRadius: config.map.clusterRadius,
				clusterMaxZoom: config.map.clusterMaxZoom
			});
			instance.addLayer({
				id: 'clusters',
				type: 'circle',
				source: 'companies',
				filter: ['has', 'point_count'],
				paint: {
					'circle-color': color('--color-fg'),
					'circle-opacity': 0.85,
					'circle-stroke-width': config.map.pointStroke,
					'circle-stroke-color': color('--color-bg'),
					// Bigger with more organizations, slowly.
					'circle-radius': ['interpolate', ['linear'], ['sqrt', ['get', 'point_count']], 1, 12, 40, 34]
				}
			});
			// How many organizations in each group.
			instance.addLayer({
				id: 'cluster-counts',
				type: 'symbol',
				source: 'companies',
				filter: ['has', 'point_count'],
				layout: {
					'text-field': ['get', 'point_count_abbreviated'],
					'text-font': config.map.font,
					'text-size': ['interpolate', ['linear'], ['sqrt', ['get', 'point_count']], 1, 11, 40, 16],
					'text-allow-overlap': true
				},
				paint: { 'text-color': color('--color-bg') }
			});
			instance.addLayer({
				id: 'companies',
				type: 'circle',
				source: 'companies',
				filter: ['!', ['has', 'point_count']],
				paint: {
					'circle-radius': config.map.pointRadius,
					'circle-color': color('--color-fg'),
					'circle-stroke-width': config.map.pointStroke,
					'circle-stroke-color': color('--color-bg')
				}
			});
			/**
			 * A list of organizations at a place, over the map.
			 * @param {{properties: Record<string, any>}[]} features
			 * @param {import('maplibre-gl').LngLatLike} at
			 */
			const popup = (features, at) => {
				const list = document.createElement('ul');
				const seen = new Set();
				for (const feature of features) {
					const { key, name, href } = feature.properties;
					if (seen.has(key) || seen.size >= config.map.popupMax) continue;
					seen.add(key);
					const link = document.createElement('a');
					link.href = href;
					link.textContent = name;
					const item = document.createElement('li');
					item.append(link);
					list.append(item);
				}
				new maplibre.Popup({ closeButton: false }).setLngLat(at).setDOMContent(list).addTo(instance);
			};
			instance.on('click', 'companies', (event) => popup(/** @type {any} */ (event.features || []), event.lngLat));
			instance.on('click', 'clusters', async (event) => {
				const feature = event.features?.[0];
				const source = /** @type {import('maplibre-gl').GeoJSONSource | undefined} */ (instance.getSource('companies'));
				if (!feature || !source) return;
				const id = feature.properties.cluster_id;
				const zoom = await source.getClusterExpansionZoom(id);
				const center = /** @type {[number, number]} */ (/** @type {import('geojson').Point} */ (feature.geometry).coordinates);
				// Organizations at the very same address never split: list them instead of zooming on.
				if (zoom > config.map.clusterMaxZoom) popup(/** @type {any} */ (await source.getClusterLeaves(id, config.map.popupMax, 0)), center);
				else instance.easeTo({ center, zoom });
			});
			for (const layer of ['companies', 'clusters']) {
				instance.on('mouseenter', layer, () => (instance.getCanvas().style.cursor = 'pointer'));
				instance.on('mouseleave', layer, () => (instance.getCanvas().style.cursor = ''));
			}
		});
	})();

	return () => {
		removed = true;
		map?.remove();
	};
}
