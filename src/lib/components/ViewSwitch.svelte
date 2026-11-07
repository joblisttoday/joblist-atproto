<script>
	import Icon from './Icon.svelte';
	import { writeView } from '#lib/navigation/explore-view.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * A list, a grid of cards (wide screens) or the map. The choice is kept, per page.
	 * mapless: nothing found has a place, so the map has nothing to show (its button is off).
	 * @type {{view: import('#lib/navigation/explore-view.js').ExploreView, page?: string, mapless?: boolean}}
	 */
	let { view = $bindable(), page = 'jobs', mapless = false } = $props();
	const id = $props.id();
	const views = /** @type {const} */ (['list', 'grid', 'map']);
	/** @type {Record<string, import('#lib/icons.js').IconName>} */
	const icons = { list: 'listView', grid: 'gridView', map: 'map' };

	/** @param {import('#lib/navigation/explore-view.js').ExploreView} next */
	function show(next) {
		view = next;
		writeView(next, page);
	}
</script>

<jl-view-switch role="group" aria-label={t(`explore.view.of.${page}`)} {view}>
	{#each views as name (name)}
		{@const off = name === 'map' && mapless}
		<!-- Off, the map stays reachable, so its reason is heard and seen on focus. -->
		<button
			type="button"
			data-view={name}
			aria-pressed={view === name}
			aria-disabled={off || undefined}
			aria-describedby={off ? `${id}-mapless` : undefined}
			onclick={() => off || show(name)}
			title={off ? undefined : t(`explore.view.${name}`)}
		>
			<Icon name={icons[name]} />
			<span>{t(`explore.view.${name}`)}</span>
		</button>
	{/each}
	{#if mapless}<small id="{id}-mapless" role="tooltip">{t('explore.view.mapless')}</small>{/if}
</jl-view-switch>

<style>
	jl-view-switch {
		position: relative;
		display: inline-flex;
		border: var(--control-border);
		border-radius: var(--radius-round);
	}
	/* Round at the ends, like the switch (no clipping: the reason shows under it). */
	button:first-of-type {
		border-start-start-radius: var(--radius-round);
		border-end-start-radius: var(--radius-round);
	}
	button:last-of-type {
		border-start-end-radius: var(--radius-round);
		border-end-end-radius: var(--radius-round);
	}
	button {
		gap: var(--space-xs);
		min-height: var(--chip-height);
		min-width: var(--chip-height);
		padding: 0 var(--space-s);
		border: 0;
		border-radius: 0;
		font-size: var(--font-size-small);
	}
	button + button {
		border-inline-start: var(--border);
	}
	button[aria-disabled='true'] {
		opacity: 0.5;
		cursor: default;
	}
	button[aria-disabled='true']:hover {
		background: var(--color-bg);
	}
	/* Why the map is off: under the switch while its button has focus or the pointer. */
	small {
		position: absolute;
		inset-block-start: calc(100% + var(--space-xs));
		inset-inline-end: 0;
		z-index: 3;
		width: max-content;
		max-width: var(--tooltip-width);
		padding: var(--space-xs) var(--space-s);
		border-radius: var(--radius);
		background: var(--color-fg);
		color: var(--color-bg);
		font-size: var(--font-size-small);
		box-shadow: var(--shadow);
		visibility: hidden;
	}
	jl-view-switch:has(button[aria-disabled='true']:is(:focus-visible, :hover)) small {
		visibility: visible;
	}
	button[aria-pressed='true'] {
		background: var(--color-fg);
		color: var(--color-bg);
	}
	button[aria-pressed='true']:hover:not(:disabled) {
		background: var(--color-fg);
	}
	/* Icons in the search's row: their names are for tooltips and screen readers. */
	span {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	/* Phones: no grid, cards are a list there (and the list shows as chosen). */
	@media not (min-width: 64rem) {
		button[data-view='grid'] {
			display: none;
		}
		jl-view-switch[view='grid'] button[data-view='list'] {
			background: var(--color-fg);
			color: var(--color-bg);
		}
	}
</style>
