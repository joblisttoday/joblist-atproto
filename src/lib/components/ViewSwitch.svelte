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
	const views = /** @type {const} */ (['list', 'grid', 'map']);
	/** @type {Record<string, import('#lib/icons.js').IconName>} */
	const icons = { list: 'listView', grid: 'gridView', map: 'map' };

	/** @param {import('#lib/navigation/explore-view.js').ExploreView} next */
	function show(next) {
		view = next;
		writeView(next, page);
	}
</script>

<jl-view-switch role="group" aria-label={t('explore.view')} {view}>
	{#each views as name (name)}
		{@const off = name === 'map' && mapless}
		<button
			type="button"
			data-view={name}
			aria-pressed={view === name}
			disabled={off}
			onclick={() => show(name)}
			title={off ? t('explore.view.mapless') : t(`explore.view.${name}`)}
		>
			<Icon name={icons[name]} />
			<span>{t(`explore.view.${name}`)}</span>
		</button>
	{/each}
</jl-view-switch>

<style>
	jl-view-switch {
		display: inline-flex;
		border: var(--border);
		border-radius: var(--radius-round);
		overflow: hidden;
	}
	button {
		gap: var(--space-xs);
		min-height: var(--chip-height);
		padding: 0 var(--space-s);
		border: 0;
		border-radius: 0;
		font-size: var(--font-size-small);
	}
	button + button {
		border-inline-start: var(--border);
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
