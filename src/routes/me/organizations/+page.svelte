<script>
	import config from '#lib/data/config.json';
	import Empty from '#lib/components/Empty.svelte';
	import QuickSearch from '#lib/components/QuickSearch.svelte';
	import KeptOrganizations from '#lib/components/KeptOrganizations.svelte';
	import PageHeader from '#lib/components/PageHeader.svelte';
	import { keptTags } from '#lib/models/kept.js';
	import { kept } from '#lib/network/kept.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/** Every organization kept in this browser, by tag if chosen, and the search to find another (a link opens its page, to keep it). */
	const tags = $derived(keptTags(kept.list));
	let tag = $state('');
</script>

<svelte:head><title>{t('kept.title')} · {config.name}</title></svelte:head>

<jl-me-organizations>
	<PageHeader title={t('kept.title')} intro={t('kept.intro')} />
	<jl-me-search><QuickSearch inline /></jl-me-search>
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
		<Empty text={t('kept.empty')} />
	{/if}
</jl-me-organizations>

<style>
	jl-me-organizations {
		display: block;
		max-width: var(--reading-width);
		margin-inline: auto;
		padding-bottom: var(--space-xl);
	}
	menu {
		flex-wrap: wrap;
		gap: var(--space-xs);
		margin: 0 0 var(--space-s);
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
	jl-me-search {
		display: block;
		margin-bottom: var(--space-m);
	}
</style>
