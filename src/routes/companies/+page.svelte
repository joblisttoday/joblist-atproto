<script>
	import config from '#lib/data/config.json';
	import ExploreTabs from '#lib/components/ExploreTabs.svelte';
	import KeptOrganizations from '#lib/components/KeptOrganizations.svelte';
	import QuickSearch from '#lib/components/QuickSearch.svelte';
	import { keptTags } from '#lib/models/kept.js';
	import { replaceState } from '$app/navigation';
	import { keepAddress, readAddress } from '#lib/navigation/address.js';
	import { kept } from '#lib/network/kept.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Explore's Organizations (/companies): the organizations you follow, in this browser, by
	 * the tags you gave them (a tag shown is after the "#": /companies#tag=coop), each with its
	 * open jobs; following another, the box.
	 */
	const tags = $derived(keptTags(kept.list));
	let tag = $state(readAddress(['tag']).get('tag') || '');
	$effect(() => {
		keepAddress({ tag }, (url) => replaceState(url, {}));
	});
</script>

<svelte:head><title>{t('nav.companies')} · {config.name}</title></svelte:head>

<jl-companies>
	<ExploreTabs />
	<jl-visually-hidden><h1>{t('nav.companies')}</h1></jl-visually-hidden>
	{#if tags.length}
		<menu aria-label={t('kept.tags')}>
			<li><button type="button" aria-pressed={tag ? 'false' : 'true'} onclick={() => (tag = '')}>{t('kept.all')}</button></li>
			{#each tags as each (each)}
				<li><button type="button" aria-pressed={tag === each ? 'true' : 'false'} onclick={() => (tag = tag === each ? '' : each)}>{each}</button></li>
			{/each}
		</menu>
	{/if}
	<KeptOrganizations {tag} />
	<QuickSearch inline legend={t('home.start')} placeholder={t('quick.placeholder.explore')} />
	<p><small>{t('curated.hint')}</small></p>
</jl-companies>

<style>
	jl-companies {
		display: block;
		max-width: var(--reading-width);
		margin-inline: auto;
		padding: var(--space-s) 0 var(--space-xl);
	}
	menu {
		display: flex;
		flex-wrap: nowrap;
		gap: var(--space-xs);
		margin: var(--space-s) calc(-1 * var(--gutter));
		padding: 0 var(--gutter);
		overflow-x: auto;
		scrollbar-width: none;
	}
	li {
		flex: none;
	}
	menu button {
		min-height: var(--chip-height);
		padding: 0 var(--space-m);
		border-radius: var(--radius-round);
		font-size: var(--font-size-small);
		white-space: nowrap;
	}
	menu button[aria-pressed='true'] {
		background: var(--color-accent);
		color: var(--color-accent-fg);
		border-color: var(--color-accent);
	}
	p {
		margin: var(--space-s) 0 0;
	}
	small {
		color: var(--color-muted);
	}
</style>
