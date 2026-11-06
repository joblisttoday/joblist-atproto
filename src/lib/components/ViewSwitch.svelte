<script>
	import Icon from './Icon.svelte';
	import { writeView } from '#lib/navigation/explore-view.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Jobs on the map, or as a list (a grid of cards on wide screens). The choice is kept.
	 * @type {{view: import('#lib/navigation/explore-view.js').ExploreView}}
	 */
	let { view = $bindable() } = $props();
	const views = /** @type {const} */ (['list', 'map']);

	/** @param {import('#lib/navigation/explore-view.js').ExploreView} next */
	function show(next) {
		view = next;
		writeView(next);
	}
</script>

<jl-view-switch role="group" aria-label={t('explore.view')}>
	{#each views as name (name)}
		<button type="button" aria-pressed={view === name} onclick={() => show(name)}>
			<Icon name={name === 'map' ? 'map' : 'listView'} />
			{t(`explore.view.${name}`)}
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
		min-height: var(--chip-height);
		padding: 0 var(--space-m);
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
</style>
