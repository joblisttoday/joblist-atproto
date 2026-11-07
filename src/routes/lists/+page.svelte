<script>
	import Empty from '#lib/components/Empty.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import { replaceState } from '$app/navigation';
	import config from '#lib/data/config.json';
	import CompanyMap from '#lib/components/CompanyMap.svelte';
	import FullScreen from '#lib/components/FullScreen.svelte';
	import ListItem from '#lib/components/ListItem.svelte';
	import ResultsHead from '#lib/components/ResultsHead.svelte';
	import SearchBar from '#lib/components/SearchBar.svelte';
	import PageMenu from '#lib/components/PageMenu.svelte';
	import ViewSwitch from '#lib/components/ViewSwitch.svelte';
	import { findLists } from '#lib/models/list-filters.js';
	import { mixedAuthors } from '#lib/models/list.js';
	import { session } from '#lib/auth/session.svelte.js';
	import { data, handleOf, membersOf, network, ownsList } from '#lib/network/network.svelte.js';
	import { listJobStats } from '#lib/network/job-counts.svelte.js';
	import { readView, viewParam } from '#lib/navigation/explore-view.js';
	import { keepAddress, readAddress } from '#lib/navigation/address.js';
	import { formatNumber, t } from '#lib/i18n/index.svelte.js';

	/**
	 * Every list, like the companies page: a search bar at the top (words, lists hiring,
	 * open to all, one's own, and how to show them), the lists using the whole screen under it,
	 * the most useful first (most open jobs). The map shows the companies of the lists found.
	 */
	// The search and the view are in the address (after the "#").
	const params = readAddress(['q', 'hiring', 'open', 'mine', 'view']);
	let query = $state(params.get('q') || '');
	let hiring = $state(params.has('hiring'));
	let open = $state(params.has('open'));
	let mine = $state(params.has('mine'));
	let view = $state(viewParam(params.get('view')) || readView('lists', 'grid'));

	/** The keys of each list's companies, by list uri. */
	const members = $derived(new Map(data.lists.map((l) => [l.uri, membersOf(l).members.map((m) => m.key)])));
	// Open offers, in its place for a list about one: as its page shows them first.
	const stats = $derived(new Map(data.lists.map((l) => [l.uri, listJobStats(l)])));
	const found = $derived(findLists(data.lists, { query, hiring, open, mine }, stats, { me: session.did, handleOf }));
	const hiringCount = $derived([...stats.values()].filter((s) => s.hiring).length);
	const openCount = $derived(data.lists.filter((l) => l.open).length);
	const mineCount = $derived(data.lists.filter(ownsList).length);
	const author = $derived(mixedAuthors(data.lists));
	// On the map: every company of the lists found, once.
	const companies = $derived.by(() => {
		if (view !== 'map') return [];
		const keys = new Set(found.flatMap((l) => members.get(l.uri) || []));
		return [...keys].map((key) => data.companies.get(key)).filter((c) => c !== undefined);
	});

	// The search and the view stay in the address, to share or come back to.
	$effect(() => keepAddress({ q: query, hiring, open, mine, view: view === 'grid' ? '' : view }, (url) => replaceState(url, {})));
</script>

<svelte:head><title>{t('nav.lists')} · {config.name}</title></svelte:head>

<jl-visually-hidden><h1>{t('nav.lists')}</h1></jl-visually-hidden>

<FullScreen {view}>
	{#snippet bar()}
		<SearchBar bind:query label={t('search.lists')} filters={t('lists.filters')}>
			{#snippet chips()}
				<li>
					<button type="button" aria-pressed={hiring} onclick={() => (hiring = !hiring)}>
						<Icon name="jobs" /> {t('lists.hiring')} <small>{formatNumber(hiringCount)}</small>
					</button>
				</li>
				{#if openCount}
					<li>
						<button type="button" aria-pressed={open} onclick={() => (open = !open)}>
							{t('lists.open')} <small>{formatNumber(openCount)}</small>
						</button>
					</li>
				{/if}
				{#if mineCount}
					<li>
						<button type="button" aria-pressed={mine} onclick={() => (mine = !mine)}>
							<Icon name="me" /> {t('lists.mine')} <small>{formatNumber(mineCount)}</small>
						</button>
					</li>
				{/if}
			{/snippet}
			{#snippet tools()}<ViewSwitch bind:view page="lists" /><PageMenu />{/snippet}
		</SearchBar>
	{/snippet}

	{#if view === 'map'}
		<CompanyMap {companies} full />
	{:else}
		<jl-lists-results {view}>
			<ResultsHead count={t('lists.count', { count: found.length, total: data.lists.length })}>
				<a href="/lists/new" data-add><Icon name="add" /> {t('list.new')}</a>
			</ResultsHead>
			<ul>
				{#each found as list (list.uri)}
					<li><ListItem {list} {author} stats={stats.get(list.uri)} /></li>
				{/each}
			</ul>
			{#if !found.length && !network.loading}
				<Empty text={data.lists.length ? t('search.none') : t('home.empty')}>
					<a href="/lists/new" data-add="main"><Icon name="add" /> {t('list.new')}</a>
				</Empty>
			{/if}
		</jl-lists-results>
	{/if}
</FullScreen>

<style>
	jl-lists-results {
		display: block;
		padding: 0 var(--gutter) var(--space-l);
	}
	ul {
		display: grid;
		grid-template-columns: var(--columns);
		column-gap: var(--column-gap);
		margin: var(--space-s) 0;
	}
	jl-lists-results[view='list'] ul {
		grid-template-columns: 1fr;
	}
</style>
