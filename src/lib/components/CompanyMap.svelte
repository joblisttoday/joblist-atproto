<script>
	import { mapPoints } from '#lib/models/company.js';
	import { mountMap } from '#lib/map/companies-map.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Companies' places on a map, or `places` given as they are (a job's).
	 * @type {{companies?: import('#lib/models/company.js').Company[], places?: import('#lib/map/companies-map.js').Point[], small?: boolean}}
	 */
	let { companies = [], places, small = false } = $props();

	const points = $derived(
		places ?? companies.flatMap((company) => mapPoints(company).map((p) => ({ ...p, company })))
	);

	/** @param {HTMLElement} node */
	function map(node) {
		return mountMap(node, points);
	}
</script>

<jl-map small={small || undefined}>
	{#if points.length}
		{#key points}
			<figure {@attach map} aria-label={t('map.label', { count: points.length })}></figure>
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
		border: var(--border);
		border-radius: var(--radius);
		overflow: hidden;
	}
	jl-map[small] figure {
		height: var(--map-height-small);
	}
	/* Edge to edge on phones. */
	@media (max-width: 48rem) {
		figure {
			margin-inline: calc(-1 * var(--gutter));
			border-inline: 0;
			border-radius: 0;
		}
	}
	/* MapLibre builds its popups outside Svelte. */
	jl-map :global(.maplibregl-popup-content) {
		background: var(--color-bg);
		color: var(--color-fg);
		padding: var(--space-s) var(--space-m);
		border-radius: var(--radius);
	}
	jl-map :global(.maplibregl-popup-content a) {
		display: block;
		padding: var(--space-xs) 0;
		font-weight: var(--font-weight-strong);
	}
	jl-map :global(.maplibregl-popup-tip) {
		display: none;
	}
</style>
