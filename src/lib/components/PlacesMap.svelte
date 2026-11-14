<script>
	import { mountMap } from '#lib/map/maplibre.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Places on a globe: an organization's, a job's, those found. Nothing when none says where
	 * it is.
	 * @type {{points: import('#lib/map/maplibre.js').Point[]}}
	 */
	let { points } = $props();
	const key = $derived(points.map((p) => `${p.lat},${p.lon},${p.label}`).join('|'));
</script>

{#if points.length}
	{#key key}
		<figure {@attach (node) => mountMap(node, points)} role="img" aria-label={t('map.label', { count: points.length })}></figure>
	{/key}
{/if}

<style>
	figure {
		position: relative;
		height: var(--map-height, min(60vh, 22rem));
		margin: var(--map-margin, var(--space-m) 0);
		overflow: hidden;
		border: var(--border);
		border-radius: var(--radius-large);
		background: var(--color-soft);
	}
	/* MapLibre builds its popups outside Svelte. */
	figure :global(.maplibregl-popup-content) {
		padding: var(--space-s) var(--space-m);
		border-radius: var(--radius);
		background: var(--color-bg);
		color: var(--color-fg);
		box-shadow: var(--shadow-menu);
	}
	figure :global(.maplibregl-popup-content ul) {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	figure :global(.maplibregl-popup-content a) {
		display: block;
		padding: var(--space-xs) 0;
		font-weight: var(--font-weight-strong);
	}
	figure :global(.maplibregl-popup-tip) {
		display: none;
	}
</style>
