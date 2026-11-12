<script>
	import { goto } from '$app/navigation';
	import config from '#lib/data/config.json';
	import Icon from '#lib/components/Icon.svelte';
	import KeptOrganizations from '#lib/components/KeptOrganizations.svelte';
	import QuickSearch from '#lib/components/QuickSearch.svelte';
	import SavedSearches from '#lib/components/SavedSearches.svelte';
	import { searchKeys } from '#lib/models/saved-search.js';
	import { keptTags } from '#lib/models/kept.js';
	import { kept } from '#lib/network/kept.svelte.js';
	import { signingIn } from '#lib/navigation/address.js';
	import { savedJobs } from '#lib/network/saved-jobs.svelte.js';
	import { searches } from '#lib/network/saved-searches.svelte.js';
	import { formatNumber, t } from '#lib/i18n/index.svelte.js';

	/**
	 * The home: the one search (a link, a domain or words), then what this browser keeps: your
	 * searches with their new jobs, and your organizations (by tag if chosen). The explorer
	 * is /jobs; an older link to a search here (/#q=design) goes on to it.
	 */
	const explorer = [...searchKeys, 'view', config.jobs.jobParam];
	$effect(() => {
		if (signingIn()) return;
		const hash = new URLSearchParams(location.hash.slice(1));
		const query = new URLSearchParams(location.search);
		if (explorer.some((key) => hash.has(key) || query.has(key))) goto(`/jobs${location.search}${location.hash}`, { replace: true });
	});

	const max = config.me.glance;
	const tags = $derived(keptTags(kept.list));
	let tag = $state('');
</script>

<svelte:head><title>{config.name}</title></svelte:head>

<jl-home>
	<h1>{t('home.heading')}</h1>
	<QuickSearch inline />

	{#if searches.list.length}
		<section aria-labelledby="home-searches">
			<h2 id="home-searches"><a href="/me/searches">{t('saved.searches')}</a></h2>
			<SavedSearches jobs={savedJobs.jobs} names={savedJobs.names} {max} />
			{#if searches.list.length > max}<p><a href="/me/searches">{t('me.all', { count: formatNumber(searches.list.length) })} <Icon name="next" /></a></p>{/if}
		</section>
	{/if}

	{#if kept.list.length}
		<section aria-labelledby="home-organizations">
			<h2 id="home-organizations">{t('kept.title')}</h2>
			{#if tags.length}
				<menu aria-label={t('kept.tags')}>
					{#each tags as each (each)}
						<li><button type="button" aria-pressed={tag === each ? 'true' : 'false'} onclick={() => (tag = tag === each ? '' : each)}>{each}</button></li>
					{/each}
				</menu>
			{/if}
			<KeptOrganizations {tag} />
		</section>
	{/if}
</jl-home>

<style>
	/* A start page: one centered column, as wide as reading, a little down the screen. */
	jl-home {
		display: block;
		max-width: var(--reading-width);
		margin-inline: auto;
		padding: var(--space-xl) 0;
	}
	h1 {
		margin: 0 0 var(--space-l);
		text-align: center;
	}
	section {
		margin-top: var(--space-xl);
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
	@media (min-width: 48rem) {
		jl-home {
			padding-top: 18vh;
		}
		h1 {
			font-size: 2.5rem;
		}
	}
</style>
