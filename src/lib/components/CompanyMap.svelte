<script>
	import config from '#lib/data/config.json';
	import { mapPoints } from '#lib/models/company.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/** @type {{companies: import('#lib/models/company.js').Company[]}} */
	let { companies } = $props();

	const points = $derived(
		companies.flatMap((company) => mapPoints(company).map((p) => ({ ...p, company })))
	);

	/**
	 * Where most locations are: drops the outer 10% on each side,
	 * so a city list is not zoomed out by a few offices elsewhere.
	 * @param {{lat: number, lon: number}[]} list
	 * @returns {[[number, number], [number, number]]}
	 */
	function mainArea(list) {
		const lats = list.map((p) => p.lat).sort((a, b) => a - b);
		const lons = list.map((p) => p.lon).sort((a, b) => a - b);
		const cut = list.length >= 10 ? Math.floor(list.length * 0.1) : 0;
		const last = list.length - 1 - cut;
		return [
			[lons[cut], lats[cut]],
			[lons[last], lats[last]]
		];
	}

	/** @param {HTMLElement} node */
	function map(node) {
		/** @type {import('maplibre-gl').Map | undefined} */
		let instance;
		let removed = false;
		(async () => {
			const [maplibre, { default: workerUrl }] = await Promise.all([
				import('maplibre-gl'),
				import('maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'),
				import('maplibre-gl/dist/maplibre-gl.css')
			]);
			maplibre.setWorkerUrl(workerUrl);
			if (removed) return;
			instance = new maplibre.Map({
				container: node,
				style: config.map.style,
				center: /** @type {[number, number]} */ (config.map.center),
				zoom: config.map.zoom,
				attributionControl: { compact: true }
			});
			for (const p of points) {
				const link = document.createElement('a');
				link.href = `/company/${p.company.key}`;
				link.textContent = p.company.name;
				new maplibre.Marker({ color: 'currentColor', scale: 0.6 })
					.setLngLat([p.lon, p.lat])
					.setPopup(new maplibre.Popup({ closeButton: false }).setDOMContent(link))
					.addTo(instance);
			}
			instance.fitBounds(mainArea(points), { padding: 40, maxZoom: 13, animate: false });
		})();
		return () => {
			removed = true;
			instance?.remove();
		};
	}
</script>

<jl-map>
	{#if points.length}
		{#key points}
			<figure {@attach map}></figure>
		{/key}
	{:else}
		<p>{t('map.none')}</p>
	{/if}
</jl-map>

<style>
	jl-map {
		display: block;
		color: var(--color-fg);
	}
	figure {
		position: relative;
		height: var(--map-height);
		margin: var(--space-s) 0;
		border-radius: var(--radius);
		overflow: hidden;
	}
</style>
