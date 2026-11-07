<script>
	import Companies from './Companies.svelte';
	import CompanyMap from './CompanyMap.svelte';
	import Jobs from './Jobs.svelte';
	import JobsMap from './JobsMap.svelte';
	import ResultsHead from './ResultsHead.svelte';
	import SuggestionCredit from './SuggestionCredit.svelte';
	import { findCompanies } from '#lib/models/company-filters.js';
	import { offerCount } from '#lib/models/job.js';
	import { jobCounts } from '#lib/network/job-counts.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * What a list shows under its bar: its jobs (read as soon as the page opens, also while
	 * its companies are shown) or its companies, as a list, a grid or on a map.
	 * offers: how many open jobs it has, for the page.
	 * @type {{
	 *   list: import('#lib/models/list.js').List,
	 *   companies: import('#lib/models/company.js').Company[],
	 *   credits: Map<string, import('#lib/models/suggestion.js').Suggestion>,
	 *   missing: number,
	 *   show: 'jobs' | 'companies',
	 *   view: import('#lib/navigation/explore-view.js').ExploreView,
	 *   filters: import('#lib/models/job.js').JobFilters,
	 *   offers?: number
	 * }}
	 */
	let { list, companies, credits, missing, show, view, filters = $bindable(), offers = $bindable(0) } = $props();

	/** @type {import('#lib/ats/job.js').Job[]} */
	let jobs = $state.raw([]);
	/** @type {import('#lib/ats/job.js').Job[]} */
	let results = $state.raw([]);
	$effect(() => {
		offers = offerCount(jobs);
	});
	const names = $derived(new Map(companies.map((c) => [c.key, c.name])));
	const counts = $derived(jobCounts());
	const found = $derived(findCompanies(companies, { query: filters.query, hiring: false, bluesky: false }, counts, new Set()));
	const map = $derived(view === 'map');
</script>

<jl-list-content {show} {view}>
	{#if map && show === 'jobs'}
		<JobsMap jobs={results} {names} fit />
	{:else if map}
		<CompanyMap companies={found} full />
	{/if}
	<jl-list-jobs hidden={map || show !== 'jobs' || undefined}>
		<Jobs {companies} search={false} bind:filters bind:jobs bind:results />
	</jl-list-jobs>
	{#if show === 'companies' && !map}
		<ResultsHead count={t('companies.count', { count: found.length, total: companies.length })} />
		<Companies companies={found} {counts} searchable={false} layout={view === 'list' ? 'list' : 'grid'}>
			{#snippet aside(company)}
				{@const suggestion = credits.get(company.key)}
				{#if suggestion}<SuggestionCredit {list} {suggestion} />{/if}
			{/snippet}
		</Companies>
		{#if !found.length && filters.query}<p>{t('search.none')}</p>{/if}
		{#if missing > 0}<p><small>{t('list.missing', { count: missing })}</small></p>{/if}
	{/if}
</jl-list-content>

<style>
	jl-list-content {
		display: block;
		padding: 0 var(--gutter) var(--space-l);
	}
	jl-list-content[view='map'] {
		height: 100%;
		padding: 0;
	}
	jl-list-jobs {
		display: block;
	}
	/* Wide screens: the jobs as cards across the width. */
	@media (min-width: 64rem) {
		jl-list-content[view='grid'] :global(jl-jobs > ul) {
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(var(--card-min), 1fr));
			column-gap: var(--column-gap);
		}
	}
</style>
