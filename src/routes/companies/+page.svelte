<script>
	import Empty from '#lib/components/Empty.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import { page } from '$app/state';
	import { replaceState } from '$app/navigation';
	import config from '#lib/data/config.json';
	import Companies from '#lib/components/Companies.svelte';
	import CompanyMap from '#lib/components/CompanyMap.svelte';
	import FullScreen from '#lib/components/FullScreen.svelte';
	import ResultsHead from '#lib/components/ResultsHead.svelte';
	import SearchBar from '#lib/components/SearchBar.svelte';
	import ViewSwitch from '#lib/components/ViewSwitch.svelte';
	import { findCompanies } from '#lib/models/company-filters.js';
	import { mapPoints } from '#lib/models/company.js';
	import { data } from '#lib/network/network.svelte.js';
	import { allAccounts } from '#lib/network/accounts.svelte.js';
	import { jobCounts } from '#lib/network/job-counts.svelte.js';
	import { readView } from '#lib/navigation/explore-view.js';
	import { formatNumber, t } from '#lib/i18n/index.svelte.js';

	/**
	 * Every company, like the jobs page: a search bar at the top (words, hiring,
	 * on Bluesky, and how to show them), the companies using the whole screen under it.
	 */
	const params = page.url.searchParams;
	// A tag or place link can open this page already searched (?q=…); ?tab=map is the map.
	let query = $state(params.get('q') || '');
	let hiring = $state(false);
	let bluesky = $state(false);
	let view = $state(params.get('tab') === 'map' ? 'map' : readView('companies', 'grid'));

	const companies = $derived([...data.companies.values()]);
	// How many jobs each company has open, as of the last snapshot.
	const counts = $derived(jobCounts());
	const accounts = $derived(allAccounts());
	const found = $derived(findCompanies(companies, { query, hiring, bluesky }, counts, accounts));
	const hiringCount = $derived(companies.filter((c) => counts.get(c.key)).length);
	const blueskyCount = $derived(companies.filter((c) => accounts.has(c.key)).length);
	// None found says where it is: no map to show.
	const mapless = $derived(companies.length > 0 && !found.some((c) => mapPoints(c).length));
	// Adding a company starts from what was searched.
	const addHref = $derived(query.trim() ? `/add?${new URLSearchParams({ url: query.trim() })}` : '/add');

	// The search stays in the address, to share or come back to.
	$effect(() => {
		const next = new URL(location.href);
		if (query.trim()) next.searchParams.set('q', query.trim());
		else next.searchParams.delete('q');
		next.searchParams.delete('tab');
		if (next.href !== location.href) replaceState(next, {});
	});
</script>

<svelte:head><title>{t('companies.title')} · {config.name}</title></svelte:head>

<FullScreen {view}>
	{#snippet bar()}
		<SearchBar bind:query label={t('search.companies')} filters={t('companies.filters')}>
			{#snippet chips()}
				<li>
					<button type="button" aria-pressed={hiring} onclick={() => (hiring = !hiring)}>
						<Icon name="jobs" /> {t('companies.hiring')} <small>{formatNumber(hiringCount)}</small>
					</button>
				</li>
				{#if blueskyCount}
					<li>
						<button type="button" aria-pressed={bluesky} onclick={() => (bluesky = !bluesky)}>
							{t('companies.onBluesky')} <small>{formatNumber(blueskyCount)}</small>
						</button>
					</li>
				{/if}
			{/snippet}
			{#snippet tools()}<ViewSwitch bind:view page="companies" {mapless} />{/snippet}
		</SearchBar>
	{/snippet}

	{#if view === 'map'}
		<CompanyMap companies={found} full />
	{:else}
		<jl-companies-results>
			<ResultsHead count={t('companies.count', { count: found.length, total: companies.length })}>
				<a href={addHref} data-add><Icon name="add" /> {t('companies.add')}</a>
			</ResultsHead>
			<Companies companies={found} {counts} searchable={false} layout={view === 'list' ? 'list' : 'grid'} />
			{#if !found.length}
				{#if query.trim()}
					<Empty text="{t('search.none')} {t('companies.missing')}">
						<a href={addHref} data-add="main"><Icon name="add" /> {t('companies.add.named', { name: query.trim() })}</a>
					</Empty>
				{:else}
					<Empty text={t('search.none')} />
				{/if}
			{/if}
		</jl-companies-results>
	{/if}
</FullScreen>

<style>
	jl-companies-results {
		display: block;
		padding: 0 var(--gutter) var(--space-l);
	}
</style>
