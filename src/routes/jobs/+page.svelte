<script>
	import PageHeader from '#lib/components/PageHeader.svelte';
	import config from '#lib/data/config.json';
	import Jobs from '#lib/components/Jobs.svelte';
	import JobsMap from '#lib/components/JobsMap.svelte';
	import SavedSearches from '#lib/components/SavedSearches.svelte';
	import SaveSearch from '#lib/components/SaveSearch.svelte';
	import { replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import { fromParams, sameSearch, toParams } from '#lib/models/saved-search.js';
	import { markSeen, searches } from '#lib/network/saved-searches.svelte.js';
	import { data } from '#lib/network/network.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	const companies = $derived([...data.companies.values()]);
	const names = $derived(new Map(companies.map((c) => [c.key, c.name])));
	// The search lives in the page address, so any search is a link to keep or share.
	let filters = $state(fromParams(page.url.searchParams));
	let since = $state('');
	/** @type {import('#lib/ats/job.js').Job[]} */
	let jobs = $state.raw([]);
	/** @type {import('#lib/ats/job.js').Job[]} */
	let results = $state.raw([]);

	// Wide screens show the list and the map side by side; phones switch between them.
	/** @type {'list' | 'map'} */
	let view = $state('list');
	let wide = $state(false);
	$effect(() => {
		const query = matchMedia(config.layout.wide);
		wide = query.matches;
		const update = () => (wide = query.matches);
		query.addEventListener('change', update);
		return () => query.removeEventListener('change', update);
	});

	/** @param {import('#lib/models/saved-search.js').SavedSearch} search */
	function open(search) {
		since = search.seen;
		filters = { query: search.query, where: search.where, remote: search.remote };
		markSeen(search);
	}

	// Opened from a kept link: its new jobs are marked, once.
	const arrived = searches.list.find((s) => sameSearch(s, filters));
	if (arrived) open(arrived);

	// A shallow replace changes the address, not page.url: compare with the location.
	$effect(() => {
		const search = toParams(filters);
		if (search !== location.search) replaceState(`/jobs${search}`, {});
	});
</script>

<svelte:head><title>{t('jobs.title')} · {config.name}</title></svelte:head>

<jl-explore {view}>
	<jl-explore-list>
		<PageHeader title={t('jobs.title')} intro={t('jobs.intro')}>
			{#snippet actions()}<a href="/jobs/new">+ {t('post.title')}</a>{/snippet}
		</PageHeader>
		<SavedSearches {jobs} {names} onopen={open} />
		{#if companies.length}
			<Jobs {companies} careers={false} bind:filters bind:jobs bind:results {since}>
				{#snippet actions()}<SaveSearch {filters} />{/snippet}
			</Jobs>
		{/if}
	</jl-explore-list>
	{#if wide || view === 'map'}
		<jl-explore-map>
			<JobsMap jobs={results} {names} here={filters.near} />
		</jl-explore-map>
	{/if}
	<button type="button" onclick={() => (view = view === 'map' ? 'list' : 'map')}>
		{view === 'map' ? t('explore.list') : t('explore.map')}
	</button>
</jl-explore>

<style>
	jl-explore {
		display: block;
	}
	/* Phones: the map takes the whole screen between the header and the navigation. */
	jl-explore-map {
		position: fixed;
		inset: var(--header-height) 0 calc(var(--nav-height) + env(safe-area-inset-bottom)) 0;
		z-index: 6;
		background: var(--color-bg);
	}
	jl-explore > button {
		position: fixed;
		left: 50%;
		bottom: calc(var(--nav-height) + env(safe-area-inset-bottom) + var(--space-m));
		z-index: 7;
		transform: translateX(-50%);
		border-radius: var(--radius-round);
		background: var(--color-accent);
		color: var(--color-accent-fg);
		border-color: var(--color-accent);
		box-shadow: var(--shadow);
	}
	jl-explore > button:hover:not(:disabled) {
		background: var(--color-accent);
	}
	/* Wide screens: the list beside a map that stays in view. */
	@media (min-width: 64rem) {
		jl-explore {
			display: grid;
			grid-template-columns: minmax(0, var(--explore-list-width)) minmax(0, 1fr);
			column-gap: var(--gutter);
			margin-right: calc(-1 * var(--gutter));
		}
		jl-explore-map {
			position: sticky;
			top: var(--header-height);
			height: calc(100dvh - var(--header-height));
			z-index: auto;
		}
		jl-explore > button {
			display: none;
		}
	}
</style>
