<script>
	import Icon from './Icon.svelte';
	import { page } from '$app/state';
	import { replaceState } from '$app/navigation';
	import FullScreen from './FullScreen.svelte';
	import ListContent from './ListContent.svelte';
	import ListHeader from './ListHeader.svelte';
	import ListPending from './ListPending.svelte';
	import ListSuggest from './ListSuggest.svelte';
	import SearchBar from './SearchBar.svelte';
	import Sheet from './Sheet.svelte';
	import ViewSwitch from './ViewSwitch.svelte';
	import { session } from '#lib/auth/session.svelte.js';
	import { data, membersOf, ownsList } from '#lib/network/network.svelte.js';
	import { jobCounts, listJobStats, listJobStatsEverywhere, listJobStatsHere } from '#lib/network/job-counts.svelte.js';
	import { listPlace } from '#lib/models/list-place.js';
	import { SHARED } from '#lib/models/list.js';
	import { readView, viewParam } from '#lib/navigation/explore-view.js';
	import { keepAddress, readAddress } from '#lib/navigation/address.js';
	import { fromParams, searchState } from '#lib/models/saved-search.js';
	import { formatNumber, t } from '#lib/i18n/index.svelte.js';

	/**
	 * A list, like the jobs page: a small header and a search bar at the top, the list's jobs
	 * (what someone looking for work comes for) or its companies using the whole screen under it.
	 * Its author's and others' actions are in the header; what they open comes as a sheet.
	 * address: what else the page keeps after the "#" (a shared list: the list itself).
	 * @type {{list: import('#lib/models/list.js').List, address?: Record<string, string>}}
	 */
	let { list, address = {} } = $props();

	// ?suggest opens "Suggest a company" (?suggest=key: back from describing it, or from signing in).
	let suggesting = $state(page.url.searchParams.has('suggest'));
	// What is shown, its search and its view are in the address (after the "#").
	const params = readAddress(['tab', 'everywhere', 'view', 'q', 'where', 'remote', 'pay']);
	let reviewing = $state(false);
	// Its jobs first; ?tab=companies its companies, ?tab=map its companies on the map (older links).
	/** @type {'jobs' | 'companies'} */
	let show = $state(params.get('tab') === 'companies' || params.get('tab') === 'map' ? 'companies' : 'jobs');
	let view = $state(params.get('tab') === 'map' ? 'map' : viewParam(params.get('view')) || readView('list', 'list'));
	/** @type {import('#lib/models/job.js').JobFilters} */
	let filters = $state(fromParams(params));
	let offers = $state(0);
	// A list about a place shows its companies' jobs there, unless asked for all of them (?everywhere).
	const place = $derived(listPlace(list));
	let everywhere = $state(params.has('everywhere'));
	const places = $derived(place && !everywhere ? place.places : undefined);
	// None of its companies' jobs is in its place: their jobs everywhere, rather than none (once the counts are read).
	let placeChecked = false;
	$effect(() => {
		if (placeChecked || !place || everywhere) return;
		const all = listJobStatsEverywhere(list).jobs;
		if (!all) return;
		placeChecked = true;
		if (!listJobStatsHere(list)?.jobs) everywhere = true;
	});

	const membership = $derived(membersOf(list));
	const described = $derived(membership.members.map((m) => data.companies.get(m.key)).filter((c) => c !== undefined));
	// Once each: two keys of the list can be the same company (added twice).
	const companies = $derived([...new Map(described.map((c) => [c.key, c])).values()]);
	const missing = $derived(membership.members.length - described.length);
	/** Who suggested each company added to an open list. */
	const credits = $derived(new Map(membership.members.flatMap((m) => (m.suggestion ? [[m.key, m.suggestion]] : []))));
	const mine = $derived(ownsList(list));
	/** Companies that cannot be suggested again: in the list, waiting, or hidden by its author. */
	const taken = $derived(
		new Set([...membership.members.map((m) => m.key), ...membership.pending.map((s) => s.company), ...list.hidden])
	);

	// A list none of whose companies has jobs open opens on its companies, unless asked otherwise.
	let chosen = params.has('tab');
	$effect(() => {
		if (chosen || !jobCounts().size) return;
		chosen = true;
		if (!listJobStats(list).jobs) show = 'companies';
	});

	// What is shown stays in the address, to share or come back to.
	$effect(() =>
		keepAddress(
			{ ...address, tab: show === 'companies' ? 'companies' : '', everywhere: Boolean(place && everywhere), view: view === 'list' ? '' : view, ...searchState(filters), area: '' },
			(url) => replaceState(url, {})
		)
	);
</script>

<FullScreen {view}>
	{#snippet bar()}
		<ListHeader {list} pending={mine ? membership.pending.length : 0} bind:suggesting bind:reviewing />
		<SearchBar
			bind:query={filters.query}
			label={show === 'jobs' ? t('jobs.filter.what') : t('search.companies')}
			filters={t('list.tabs')}
		>
			{#snippet chips()}
				<li>
					<button type="button" aria-pressed={show === 'jobs'} onclick={() => ((show = 'jobs'), (chosen = true))}>
						<Icon name="jobs" /> {t('list.tab.jobs')} <small>{formatNumber(offers)}</small>
					</button>
				</li>
				<!-- Next to its count, so that it shows on a phone too; off: its companies' jobs everywhere. -->
				{#if show === 'jobs' && place}
					<li>
						<button type="button" aria-pressed={!everywhere} onclick={() => (everywhere = !everywhere)}>
							<Icon name="place" /> {t('list.place.in', { place: place.name })}
						</button>
					</li>
				{/if}
				<li>
					<button type="button" aria-pressed={show === 'companies'} onclick={() => ((show = 'companies'), (chosen = true))}>
						<Icon name="companies" /> {t('list.tab.companies')} <small>{formatNumber(companies.length)}</small>
					</button>
				</li>
				{#if show === 'jobs'}
					<li>
						<button type="button" aria-pressed={!!filters.remote} onclick={() => (filters.remote = filters.remote ? '' : 'remote')}>
							<Icon name="remote" /> {t('jobs.filter.workplace.remote')}
						</button>
					</li>
				{/if}
			{/snippet}
			{#snippet tools()}<ViewSwitch bind:view page="list" />{/snippet}
		</SearchBar>
	{/snippet}

	<ListContent {list} {companies} {credits} {missing} {show} {view} {places} bind:filters bind:offers />
</FullScreen>

{#if mine && membership.pending.length}
	<Sheet bind:open={reviewing} label={t('suggestion.pending', { count: membership.pending.length })}>
		<ListPending {list} pending={membership.pending} />
	</Sheet>
{/if}
{#if session.did && !mine && list.did !== SHARED}
	<Sheet bind:open={suggesting} label={t('suggestion.title')}>
		<ListSuggest {list} {taken} />
	</Sheet>
{/if}
