<script>
	import config from '#lib/data/config.json';
	import Empty from '#lib/components/Empty.svelte';
	import KeptOrganizations from '#lib/components/KeptOrganizations.svelte';
	import QuickSearch from '#lib/components/QuickSearch.svelte';
	import { keptTags } from '#lib/models/kept.js';
	import { kept } from '#lib/network/kept.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * The organizations you follow (in this browser only): paste another to follow it, then
	 * the ones followed, by tag if chosen, each with its open jobs.
	 */
	const tags = $derived(keptTags(kept.list));
	let tag = $state('');
</script>

<svelte:head><title>{t('nav.following')} · {config.name}</title></svelte:head>

<jl-following>
	<h1>{t('nav.following')}</h1>
	<QuickSearch inline placeholder={t('quick.placeholder.start')} />
	{#if tags.length}
		<menu aria-label={t('kept.tags')}>
			{#each tags as each (each)}
				<li><button type="button" aria-pressed={tag === each ? 'true' : 'false'} onclick={() => (tag = tag === each ? '' : each)}>{each}</button></li>
			{/each}
		</menu>
	{/if}
	{#if kept.list.length}
		<KeptOrganizations {tag} />
	{:else}
		<Empty text={t('following.empty')} />
	{/if}
</jl-following>

<style>
	jl-following {
		display: block;
		max-width: var(--reading-width);
		margin-inline: auto;
		padding-bottom: var(--space-xl);
	}
	menu {
		flex-wrap: wrap;
		gap: var(--space-xs);
		margin: var(--space-m) 0 var(--space-s);
	}
	menu button {
		min-height: var(--chip-height);
		padding: 0 var(--space-m);
		border-radius: var(--radius-round);
		font-size: var(--font-size-small);
	}
	menu button[aria-pressed='true'] {
		background: var(--color-accent);
		color: var(--color-accent-fg);
		border-color: var(--color-accent);
	}
	jl-following > :global(jl-kept-organizations) {
		margin-top: var(--space-m);
	}
</style>
