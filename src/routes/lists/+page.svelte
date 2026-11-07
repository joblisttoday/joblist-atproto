<script>
	import Icon from '#lib/components/Icon.svelte';
	import { page } from '$app/state';
	import { replaceState } from '$app/navigation';
	import config from '#lib/data/config.json';
	import CompanyMap from '#lib/components/CompanyMap.svelte';
	import FullScreen from '#lib/components/FullScreen.svelte';
	import ListItem from '#lib/components/ListItem.svelte';
	import ResultsHead from '#lib/components/ResultsHead.svelte';
	import SearchBar from '#lib/components/SearchBar.svelte';
	import ViewSwitch from '#lib/components/ViewSwitch.svelte';
	import { findLists, listStats } from '#lib/models/list-filters.js';
	import { mixedAuthors } from '#lib/models/list.js';
	import { session } from '#lib/auth/session.svelte.js';
	import { data, handleOf, membersOf, network } from '#lib/network/network.svelte.js';
	import { jobCounts } from '#lib/network/job-counts.svelte.js';
	import { readView } from '#lib/navigation/explore-view.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Every list, like the companies page: a search bar at the top (words, lists hiring,
	 * open to all, one's own, and how to show them), the lists using the whole screen under it,
	 * the most useful first (most open jobs). The map shows the companies of the lists found.
	 */
	let query = $state(page.url.searchParams.get('q') || '');
	let hiring = $state(false);
	let open = $state(false);
	let mine = $state(false);
	let view = $state(readView('lists', 'list'));

	/** The keys of each list's companies, by list uri. */
	const members = $derived(new Map(data.lists.map((l) => [l.uri, membersOf(l).members.map((m) => m.key)])));
	const stats = $derived(new Map([...members].map(([uri, keys]) => [uri, listStats(keys, jobCounts())])));
	const found = $derived(findLists(data.lists, { query, hiring, open, mine }, stats, { me: session.did, handleOf }));
	const hiringCount = $derived([...stats.values()].filter((s) => s.hiring).length);
	const openCount = $derived(data.lists.filter((l) => l.open).length);
	const mineCount = $derived(session.did ? data.lists.filter((l) => l.did === session.did).length : 0);
	const author = $derived(mixedAuthors(data.lists));
	// On the map: every company of the lists found, once.
	const companies = $derived.by(() => {
		if (view !== 'map') return [];
		const keys = new Set(found.flatMap((l) => members.get(l.uri) || []));
		return [...keys].map((key) => data.companies.get(key)).filter((c) => c !== undefined);
	});

	// The search stays in the address, to share or come back to.
	$effect(() => {
		const next = new URL(location.href);
		if (query.trim()) next.searchParams.set('q', query.trim());
		else next.searchParams.delete('q');
		if (next.href !== location.href) replaceState(next, {});
	});
</script>

<svelte:head><title>{t('nav.lists')} · {config.name}</title></svelte:head>

<FullScreen {view}>
	{#snippet bar()}
		<SearchBar bind:query label={t('search.lists')} filters={t('lists.filters')}>
			{#snippet chips()}
				<li>
					<button type="button" aria-pressed={hiring} onclick={() => (hiring = !hiring)}>
						<Icon name="jobs" /> {t('lists.hiring')} <small>{hiringCount}</small>
					</button>
				</li>
				{#if openCount}
					<li>
						<button type="button" aria-pressed={open} onclick={() => (open = !open)}>
							{t('lists.open')} <small>{openCount}</small>
						</button>
					</li>
				{/if}
				{#if mineCount}
					<li>
						<button type="button" aria-pressed={mine} onclick={() => (mine = !mine)}>
							<Icon name="me" /> {t('lists.mine')} <small>{mineCount}</small>
						</button>
					</li>
				{/if}
			{/snippet}
			{#snippet tools()}<ViewSwitch bind:view page="lists" />{/snippet}
		</SearchBar>
	{/snippet}

	{#if view === 'map'}
		<CompanyMap {companies} full />
	{:else}
		<jl-lists-results {view}>
			<ResultsHead count={t('lists.count', { count: found.length, total: data.lists.length })}>
				<a href="/lists/new"><Icon name="add" /> {t('list.new')}</a>
			</ResultsHead>
			<ul>
				{#each found as list (list.uri)}
					<li><ListItem {list} {author} /></li>
				{/each}
			</ul>
			{#if !found.length && !network.loading}
				<p>{data.lists.length ? t('search.none') : t('home.empty')}</p>
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
