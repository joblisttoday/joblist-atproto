import config from '#lib/data/config.json';
import { mainArea } from './companies-map.js';
import { focusArea } from './focus.js';
import { createMap, cssColors, loadMapLibre } from './maplibre.js';

/**
 * @typedef {{point: [number, number], title: string, url: string, company: string}} MapJob
 * @typedef {{top: number, right: number, bottom: number, left: number}} Insets
 * @typedef {{setJobs: (jobs: MapJob[], fit?: boolean) => void, setHere: (here: [number, number] | null | undefined) => void, setSelected: (point: [number, number] | null | undefined) => void, setCovered: (covered: Insets) => void, destroy: () => void}} JobsMap
 *   setSelected: the job open in the page, ringed on the map and brought into view.
 *   setCovered: the part of the map under the page's panels, kept out of framing.
 *   fit: frame the jobs (after a search), else show the whole globe.
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
 * @param {{label: (count: number) => string, onpick?: (urls: string[]) => void}} text
 *   onpick: the jobs at a place someone tapped (else a popup lists them).
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
	/** @type {[number, number] | null | undefined} */
	let selected = null;
	const color = cssColors(node);
	/** @type {ReturnType<typeof setTimeout> | undefined} */
	let framing;
	let framed = false;
	// Whether the jobs are to be framed: they may arrive before the map is ready.
	let fitting = false;
	/** @type {Insets} */
	let covered = { top: 0, right: 0, bottom: 0, left: 0 };
	// Where the globe faces when showing the whole network: most jobs are north of the equator.
	const globeCenter = /** @type {[number, number]} */ (config.map.globeCenter);
	/** The zoom showing the whole globe in the free part of the map, whatever the screen. */
	const globeZoom = () => {
		const free = Math.min(node.clientWidth - covered.left - covered.right, node.clientHeight - covered.top - covered.bottom);
		return Math.max(config.map.globeMinZoom, Math.log2(free / config.map.globeSizePx));
	};

	/** Frame the jobs found, once the search settles; the whole globe when there is no search. */
	function frame(/** @type {boolean} */ fit) {
		clearTimeout(framing);
		framing = setTimeout(() => {
			if (!map || !ready || here || selected) return;
			if (fit && jobs.length) {
				// Mostly in one city: that city; else where most of them are.
				const [[west, south], [east, north]] =
					focusArea(jobs.map((j) => j.point), config.map.focus) || mainArea(jobs.map((j) => ({ lon: j.point[0], lat: j.point[1] })));
				// Spread over continents: turn the globe to them rather than flatten it.
				if (east - west > config.map.globeSpan) map.easeTo({ center: [(west + east) / 2, (south + north) / 2], zoom: globeZoom(), padding: covered });
				else {
					// MapLibre adds the map's padding to the one given here: the panels once, then some room.
					map.setPadding(covered);
					map.fitBounds([[west, south], [east, north]], { padding: config.map.padding, maxZoom: config.map.maxZoom });
				}
				framed = true;
			} else if (!fit && framed) {
				map.easeTo({ center: globeCenter, zoom: globeZoom(), padding: covered });
				framed = false;
			}
		}, config.map.frameDelayMs);
	}

	const source = (/** @type {string} */ id) => /** @type {import('maplibre-gl').GeoJSONSource | undefined} */ (map?.getSource(id));
	function render() {
		if (!ready) return;
		source('jobs')?.setData(toGeoJson(jobs));
		source('here')?.setData(hereGeoJson(here));
		source('selected')?.setData(hereGeoJson(selected));
		node.setAttribute('aria-label', text.label(jobs.length));
	}

	(async () => {
		const maplibre = await loadMapLibre();
		if (removed) return;
		map = createMap(maplibre, node, { center: globeCenter, zoom: globeZoom() });
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
			instance.addSource('selected', { type: 'geojson', data: hereGeoJson(null) });
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
					'circle-radius': ['interpolate', ['linear'], ['sqrt', ['get', 'point_count']], 1, 12, 40, 34]
				}
			});
			// How many jobs in each cluster.
			instance.addLayer({
				id: 'cluster-counts',
				type: 'symbol',
				source: 'jobs',
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
			// Around each point, a wider invisible circle that takes the taps: a finger is wider than a dot.
			instance.addLayer({
				id: 'jobs-hit',
				type: 'circle',
				source: 'jobs',
				filter: ['!', ['has', 'point_count']],
				paint: { 'circle-radius': config.map.hitRadius, 'circle-color': 'transparent' }
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

			// The open job: a ring around its place.
			instance.addLayer({
				id: 'selected',
				type: 'circle',
				source: 'selected',
				paint: {
					'circle-radius': config.map.pointRadius * 2.5,
					'circle-color': 'transparent',
					'circle-stroke-width': config.map.pointStroke + 1,
					'circle-stroke-color': color('--color-focus')
				}
			});

			instance.on('click', 'clusters', async (event) => {
				const feature = event.features?.[0];
				if (!feature) return;
				const jobsSource = source('jobs');
				const id = feature.properties.cluster_id;
				const zoom = await jobsSource?.getClusterExpansionZoom(id);
				// Jobs at the very same place never split: list them instead of zooming on.
				if (text.onpick && jobsSource && zoom !== undefined && zoom > config.map.clusterMaxZoom) {
					const leaves = await jobsSource.getClusterLeaves(id, config.map.placeMax, 0);
					text.onpick(leaves.map((leaf) => String(leaf.properties?.url)));
					return;
				}
				instance.easeTo({ center: /** @type {[number, number]} */ (/** @type {import('geojson').Point} */ (feature.geometry).coordinates), zoom });
			});
			instance.on('click', 'jobs-hit', (event) => {
				if (text.onpick) {
					text.onpick([...new Set((event.features || []).map((f) => String(f.properties.url)))]);
					return;
				}
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
			for (const layer of ['clusters', 'jobs-hit']) {
				instance.on('mouseenter', layer, () => (instance.getCanvas().style.cursor = 'pointer'));
				instance.on('mouseleave', layer, () => (instance.getCanvas().style.cursor = ''));
			}
			ready = true;
			render();
			// Someone searching near them before the map was ready.
			if (here) instance.jumpTo({ center: here, zoom: config.map.nearZoom, padding: covered });
			else instance.jumpTo({ center: globeCenter, zoom: globeZoom(), padding: covered });
			// A search found before the map was ready.
			if (fitting) frame(true);
		});
	})();

	return {
		setJobs(list, fit = false) {
			jobs = list;
			fitting = fit;
			render();
			frame(fit);
		},
		setHere(point) {
			const moved = point && (!here || point[0] !== here[0] || point[1] !== here[1]);
			here = point;
			render();
			if (moved && ready && map) map.flyTo({ center: point, zoom: config.map.nearZoom, padding: covered });
		},
		setSelected(point) {
			selected = point;
			render();
			if (point && ready && map) {
				map.easeTo({ center: point, zoom: Math.max(map.getZoom(), config.map.selectZoom), padding: covered });
			}
		},
		setCovered(insets) {
			const first = !covered.left && !covered.bottom;
			covered = insets;
			// The panel was measured after the map was made: show the globe in the free part.
			if (first && ready && map && !here && !framed) map.jumpTo({ center: globeCenter, zoom: globeZoom(), padding: covered });
		},
		destroy() {
			removed = true;
			map?.remove();
		}
	};
}
