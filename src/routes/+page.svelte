<script>
	import { goto } from '$app/navigation';
	import config from '#lib/data/config.json';
	import Icon from '#lib/components/Icon.svelte';
	import ExploreSearch from '#lib/components/ExploreSearch.svelte';
	import MenuLinks from '#lib/components/MenuLinks.svelte';
	import PageHeader from '#lib/components/PageHeader.svelte';
	import SavedSearches from '#lib/components/SavedSearches.svelte';
	import { getSnapshotCounts } from '#lib/network/snapshot.js';
	import { searchKeys, searchState } from '#lib/models/saved-search.js';
	import { addressOf, signingIn } from '#lib/navigation/address.js';
	import { savedJobs } from '#lib/network/saved-jobs.svelte.js';
	import { searches } from '#lib/network/saved-searches.svelte.js';
	import { formatNumber, t } from '#lib/i18n/index.svelte.js';

	/**
	 * The home: what joblist is, the search every page has, your searches (kept in this
	 * browser) with their new jobs, and the ways in. The explorer is /jobs; an older link
	 * to a search here (/#q=design) goes on to it.
	 */
	const explorer = [...searchKeys, 'view', config.jobs.jobParam];
	$effect(() => {
		if (signingIn()) return;
		const hash = new URLSearchParams(location.hash.slice(1));
		const query = new URLSearchParams(location.search);
		if (explorer.some((key) => hash.has(key) || query.has(key))) goto(`/jobs${location.search}${location.hash}`, { replace: true });
	});

	/** @type {import('#lib/models/job.js').JobFilters} */
	let filters = $state({ query: '', where: '', remote: '', pay: false, near: null, within: 0 });
	/** The places hiring the most, offered as the place is typed (a small file). @type {string[]} */
	let places = $state.raw([]);
	getSnapshotCounts().then((counts) => (places = (counts?.places || []).slice(0, config.jobs.placesSuggested).map(([place]) => place)));
	const max = config.me.glance;

	// The explorer, with the search as it was typed and chosen (near someone stays in this page's memory).
	function search() {
		if (filters.near) searches.opening = { ...$state.snapshot(filters), seen: '' };
		goto(addressOf(searchState(filters), '/jobs'));
	}

	/** @type {import('#lib/navigation/nav.js').MenuLink[]} */
	const ways = $derived([
		{ href: '/in', icon: 'place', label: t('landing.cities') },
		{ href: '/field', icon: 'jobs', label: t('landing.fields') },
		{ href: '/companies', icon: 'companies', label: t('nav.companies') }
	]);
</script>

<svelte:head><title>{config.name}</title></svelte:head>

<jl-home>
	<PageHeader title={t('home.heading')} intro={t('home.lead')} />

	<!-- The same search as every page's: what, where, the quick choices; sent to the explorer. -->
	<ExploreSearch bind:filters {places} onsubmit={search}>
		{#snippet tools()}<button type="submit" data-go><Icon name="search" /> {t('saved.explore')}</button>{/snippet}
	</ExploreSearch>

	{#if searches.list.length}
		<section aria-labelledby="home-searches">
			<h2 id="home-searches"><a href="/me/searches">{t('saved.searches')}</a></h2>
			<SavedSearches jobs={savedJobs.jobs} names={savedJobs.names} {max} />
			{#if searches.list.length > max}<p><a href="/me/searches">{t('me.all', { count: formatNumber(searches.list.length) })} <Icon name="next" /></a></p>{/if}
		</section>
	{/if}

	<jl-home-ways><MenuLinks label={t('menu.explore')} items={ways} /></jl-home-ways>
</jl-home>

<style>
	jl-home {
		display: block;
		padding-bottom: var(--space-xl);
	}
	section {
		margin-top: var(--space-l);
	}
	button[data-go] {
		flex: none;
		min-height: var(--chip-height);
		padding: 0 var(--space-m);
		border-radius: var(--radius-round);
		background: var(--color-accent);
		color: var(--color-accent-fg);
		border-color: var(--color-accent);
		font-size: var(--font-size-small);
	}
	jl-home-ways {
		display: block;
		margin-top: var(--space-l);
	}
	/* The search, a little apart from what joblist is. */
	jl-home > :global(jl-explore-search) {
		display: block;
		margin-top: var(--space-m);
	}
	/* Wide screens: the ways in side by side, each its own box. */
	@media (min-width: 48rem) {
		jl-home-ways :global(menu) {
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			gap: var(--space-s);
			border: 0;
		}
		jl-home-ways :global(li) {
			border: var(--border);
			border-radius: var(--radius);
		}
	}
</style>
