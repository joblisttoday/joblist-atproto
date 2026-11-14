import config from '#lib/data/config.json';

/**
 * MapLibre, loaded on demand: it is large, and only pages with a map need it.
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
 * Places on a globe (OpenFreeMap's tiles, in the page's light or dark), as circles in the
 * page's colors; nearby ones grouped, with how many, opening closer on a tap. A tap on a
 * place lists what is there, as links.
 * @typedef {{lat: number, lon: number, label: string, href?: string}} Point
 *   label: what is there; href: where a tap on it leads.
 * @param {HTMLElement} node
 * @param {Point[]} points
 * @returns {() => void} cleanup
 */
export function mountMap(node, points) {
	/** @type {import('maplibre-gl').Map | undefined} */
	let map;
	let removed = false;
	const css = getComputedStyle(node);
	const color = (/** @type {string} */ name) => css.getPropertyValue(name).trim();

	(async () => {
		const maplibre = await loadMapLibre();
		if (removed) return;
		const dark = matchMedia('(prefers-color-scheme: dark)').matches;
		const m = new maplibre.Map({
			container: node,
			style: dark ? config.map.styleDark : config.map.style,
			center: /** @type {[number, number]} */ (config.map.center),
			zoom: config.map.zoom,
			attributionControl: { compact: true },
			cooperativeGestures: !matchMedia(config.map.finePointer).matches
		});
		map = m;
		if (matchMedia(config.map.finePointer).matches) m.addControl(new maplibre.NavigationControl({ showCompass: false }));
		m.on('style.load', () => m.setProjection({ type: config.map.projection }));
		if (points.length === 1) m.jumpTo({ center: [points[0].lon, points[0].lat], zoom: config.map.maxZoom - 2 });
		else if (points.length > 1) {
			const lons = points.map((p) => p.lon);
			const lats = points.map((p) => p.lat);
			m.fitBounds(
				[
					[Math.min(...lons), Math.min(...lats)],
					[Math.max(...lons), Math.max(...lats)]
				],
				{ padding: config.map.padding, maxZoom: config.map.maxZoom - 2, animate: false }
			);
		}
		m.on('load', () => {
			m.resize();
			m.addSource('places', {
				type: 'geojson',
				data: {
					type: 'FeatureCollection',
					features: points.map((p) => ({ type: 'Feature', geometry: { type: 'Point', coordinates: [p.lon, p.lat] }, properties: { label: p.label, href: p.href || '' } }))
				},
				cluster: true,
				clusterRadius: config.map.clusterRadius,
				clusterMaxZoom: config.map.clusterMaxZoom
			});
			const circle = { 'circle-color': color('--color-fg'), 'circle-stroke-width': config.map.pointStroke, 'circle-stroke-color': color('--color-bg') };
			m.addLayer({
				id: 'groups',
				type: 'circle',
				source: 'places',
				filter: ['has', 'point_count'],
				paint: { ...circle, 'circle-opacity': 0.85, 'circle-radius': ['interpolate', ['linear'], ['sqrt', ['get', 'point_count']], 1, 12, 40, 34] }
			});
			m.addLayer({
				id: 'group-counts',
				type: 'symbol',
				source: 'places',
				filter: ['has', 'point_count'],
				layout: { 'text-field': ['get', 'point_count_abbreviated'], 'text-font': config.map.font, 'text-size': 12, 'text-allow-overlap': true },
				paint: { 'text-color': color('--color-bg') }
			});
			m.addLayer({ id: 'places', type: 'circle', source: 'places', filter: ['!', ['has', 'point_count']], paint: { ...circle, 'circle-radius': config.map.pointRadius } });

			/** What is at a place, over the map. @param {{properties: Record<string, any>}[]} features @param {import('maplibre-gl').LngLatLike} at */
			const popup = (features, at) => {
				const list = document.createElement('ul');
				const seen = new Set();
				for (const { properties } of features) {
					const key = `${properties.label}|${properties.href}`;
					if (seen.has(key) || seen.size >= config.map.popupMax) continue;
					seen.add(key);
					const item = document.createElement('li');
					const inner = document.createElement(properties.href ? 'a' : 'span');
					if (properties.href) /** @type {HTMLAnchorElement} */ (inner).href = properties.href;
					inner.textContent = properties.label;
					item.append(inner);
					list.append(item);
				}
				new maplibre.Popup({ closeButton: false }).setLngLat(at).setDOMContent(list).addTo(m);
			};
			m.on('click', 'places', (event) => popup(/** @type {any} */ (event.features || []), event.lngLat));
			m.on('click', 'groups', async (event) => {
				const feature = event.features?.[0];
				const source = /** @type {import('maplibre-gl').GeoJSONSource | undefined} */ (m.getSource('places'));
				if (!feature || !source) return;
				const id = feature.properties.cluster_id;
				const zoom = await source.getClusterExpansionZoom(id);
				const center = /** @type {[number, number]} */ (/** @type {import('geojson').Point} */ (feature.geometry).coordinates);
				// Places at the very same spot never split: listed instead.
				if (zoom > config.map.clusterMaxZoom) popup(/** @type {any} */ (await source.getClusterLeaves(id, config.map.popupMax, 0)), center);
				else m.easeTo({ center, zoom });
			});
			for (const layer of ['places', 'groups']) {
				m.on('mouseenter', layer, () => (m.getCanvas().style.cursor = 'pointer'));
				m.on('mouseleave', layer, () => (m.getCanvas().style.cursor = ''));
			}
		});
	})();

	return () => {
		removed = true;
		map?.remove();
	};
}
