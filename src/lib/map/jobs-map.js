import config from '#lib/data/config.json';
import { createMap, cssColors, loadMapLibre } from './maplibre.js';

/**
 * @typedef {{point: [number, number], title: string, url: string, company: string}} MapJob
 * @typedef {{setJobs: (jobs: MapJob[]) => void, setHere: (here: [number, number] | null | undefined) => void, destroy: () => void}} JobsMap
 */

/** @param {MapJob[]} jobs */
function toGeoJson(jobs) {
	return /** @type {import('geojson').FeatureCollection} */ ({
		type: 'FeatureCollection',
		features: jobs.map((job) => ({
			type: 'Feature',
			geometry: { type: 'Point', coordinates: job.point },
			properties: { title: job.title, url: job.url, company: job.company }
		}))
	});
}

/** @param {[number, number] | null | undefined} here */
function hereGeoJson(here) {
	return /** @type {import('geojson').FeatureCollection} */ ({
		type: 'FeatureCollection',
		features: here ? [{ type: 'Feature', geometry: { type: 'Point', coordinates: here }, properties: {} }] : []
	});
}

/**
 * Jobs as clusters on a globe: a cluster opens closer on click, a single place lists its jobs.
 * The map is made once; setJobs and setHere update it as the search changes.
 * @param {HTMLElement} node
 * @param {{label: (count: number) => string}} text
 * @returns {JobsMap}
 */
export function mountJobsMap(node, text) {
	/** @type {import('maplibre-gl').Map | undefined} */
	let map;
	let ready = false;
	let removed = false;
	/** @type {MapJob[]} */
	let jobs = [];
	/** @type {[number, number] | null | undefined} */
	let here = null;
	const color = cssColors(node);

	const source = (/** @type {string} */ id) => /** @type {import('maplibre-gl').GeoJSONSource | undefined} */ (map?.getSource(id));
	function render() {
		if (!ready) return;
		source('jobs')?.setData(toGeoJson(jobs));
		source('here')?.setData(hereGeoJson(here));
		node.setAttribute('aria-label', text.label(jobs.length));
	}

	(async () => {
		const maplibre = await loadMapLibre();
		if (removed) return;
		map = createMap(maplibre, node, { zoom: 1.2 });
		const instance = map;
		instance.on('load', () => {
			instance.resize();
			instance.addSource('jobs', {
				type: 'geojson',
				data: toGeoJson([]),
				cluster: true,
				clusterRadius: config.map.clusterRadius,
				clusterMaxZoom: config.map.clusterMaxZoom
			});
			instance.addSource('here', { type: 'geojson', data: hereGeoJson(null) });
			instance.addLayer({
				id: 'clusters',
				type: 'circle',
				source: 'jobs',
				filter: ['has', 'point_count'],
				paint: {
					'circle-color': color('--color-fg'),
					'circle-opacity': 0.85,
					'circle-stroke-width': config.map.pointStroke,
					'circle-stroke-color': color('--color-bg'),
					// Bigger with more jobs, slowly.
					'circle-radius': ['interpolate', ['linear'], ['sqrt', ['get', 'point_count']], 1, 8, 40, 34]
				}
			});
			instance.addLayer({
				id: 'jobs',
				type: 'circle',
				source: 'jobs',
				filter: ['!', ['has', 'point_count']],
				paint: {
					'circle-radius': config.map.pointRadius,
					'circle-color': color('--color-fg'),
					'circle-stroke-width': config.map.pointStroke,
					'circle-stroke-color': color('--color-bg')
				}
			});
			instance.addLayer({
				id: 'here',
				type: 'circle',
				source: 'here',
				paint: {
					'circle-radius': config.map.pointRadius + 2,
					'circle-color': color('--color-focus'),
					'circle-stroke-width': config.map.pointStroke + 1,
					'circle-stroke-color': color('--color-bg')
				}
			});

			instance.on('click', 'clusters', async (event) => {
				const feature = event.features?.[0];
				if (!feature) return;
				const zoom = await source('jobs')?.getClusterExpansionZoom(feature.properties.cluster_id);
				instance.easeTo({ center: /** @type {[number, number]} */ (/** @type {import('geojson').Point} */ (feature.geometry).coordinates), zoom });
			});
			instance.on('click', 'jobs', (event) => {
				const list = document.createElement('ul');
				for (const feature of (event.features || []).slice(0, config.map.popupMax)) {
					const { title, url, company } = feature.properties;
					const link = document.createElement('a');
					link.href = url;
					link.target = '_blank';
					link.rel = 'noopener';
					link.textContent = title;
					const item = document.createElement('li');
					item.append(link, ` ${company}`);
					list.append(item);
				}
				new maplibre.Popup({ closeButton: false }).setLngLat(event.lngLat).setDOMContent(list).addTo(instance);
			});
			for (const layer of ['clusters', 'jobs']) {
				instance.on('mouseenter', layer, () => (instance.getCanvas().style.cursor = 'pointer'));
				instance.on('mouseleave', layer, () => (instance.getCanvas().style.cursor = ''));
			}
			ready = true;
			render();
			// Someone searching near them before the map was ready.
			if (here) instance.jumpTo({ center: here, zoom: config.map.nearZoom });
		});
	})();

	return {
		setJobs(list) {
			jobs = list;
			render();
		},
		setHere(point) {
			const moved = point && (!here || point[0] !== here[0] || point[1] !== here[1]);
			here = point;
			render();
			if (moved && ready && map) map.flyTo({ center: point, zoom: config.map.nearZoom });
		},
		destroy() {
			removed = true;
			map?.remove();
		}
	};
}
