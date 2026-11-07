<script>
	import Icon from '#lib/components/Icon.svelte';
	import { page } from '$app/state';
	import { replaceState } from '$app/navigation';
	import config from '#lib/data/config.json';
	import FullScreen from '#lib/components/FullScreen.svelte';
	import ListContent from '#lib/components/ListContent.svelte';
	import ListHeader from '#lib/components/ListHeader.svelte';
	import ListPending from '#lib/components/ListPending.svelte';
	import ListSuggest from '#lib/components/ListSuggest.svelte';
	import Pending from '#lib/components/Pending.svelte';
	import SearchBar from '#lib/components/SearchBar.svelte';
	import Sheet from '#lib/components/Sheet.svelte';
	import ViewSwitch from '#lib/components/ViewSwitch.svelte';
	import { session } from '#lib/auth/session.svelte.js';
	import { data, handleOf, membersOf, network } from '#lib/network/network.svelte.js';
	import { loadList } from '#lib/network/load-list.js';
	import { jobCounts } from '#lib/network/job-counts.svelte.js';
	import { listStats } from '#lib/models/list-filters.js';
	import { listPlace } from '#lib/models/list-place.js';
	import { readView } from '#lib/navigation/explore-view.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * A list, like the jobs page: a small header and a search bar at the top, the list's jobs
	 * (what someone looking for work comes for) or its companies using the whole screen under it.
	 * Its author's and others' actions are in the header; what they open comes as a sheet.
	 */
	const handle = $derived(page.params.handle || '');
	const rkey = $derived(page.params.rkey || '');
	const known = $derived(
		data.lists.find((l) => l.rkey === rkey && (l.did === handle || handleOf(l.did) === handle))
	);
	/** @type {import('#lib/models/list.js').List | null | undefined} */
	let fetched = $state(undefined);
	const list = $derived(known || fetched);

	$effect(() => {
		if (known || network.loading) return;
		loadList(handle, rkey)
			.then((l) => (fetched = l))
			.catch(() => (fetched = null));
	});

	const params = page.url.searchParams;
	// ?suggest opens "Suggest a company" (?suggest=key: back from describing it, or from signing in).
	let suggesting = $state(params.has('suggest'));
	let reviewing = $state(false);
	// Its jobs first; ?tab=companies its companies, ?tab=map its companies on the map (older links).
	/** @type {'jobs' | 'companies'} */
	let show = $state(params.get('tab') === 'companies' || params.get('tab') === 'map' ? 'companies' : 'jobs');
	let view = $state(params.get('tab') === 'map' ? 'map' : readView('list', 'list'));
	/** @type {import('#lib/models/job.js').JobFilters} */
	let filters = $state({ query: '', where: '', remote: '' });
	let offers = $state(0);
	// A list about a place shows its companies' jobs there, unless asked for all of them (?everywhere).
	const place = $derived(list ? listPlace(list) : null);
	let everywhere = $state(params.has('everywhere'));
	const places = $derived(place && !everywhere ? place.places : undefined);

	const membership = $derived(list ? membersOf(list) : { members: [], pending: [] });
	const described = $derived(membership.members.map((m) => data.companies.get(m.key)).filter((c) => c !== undefined));
	// Once each: two keys of the list can be the same company (added twice).
	const companies = $derived([...new Map(described.map((c) => [c.key, c])).values()]);
	const missing = $derived(membership.members.length - described.length);
	/** Who suggested each company added to an open list. */
	const credits = $derived(new Map(membership.members.flatMap((m) => (m.suggestion ? [[m.key, m.suggestion]] : []))));
	const mine = $derived(Boolean(list && session.did === list.did));
	/** Companies that cannot be suggested again: in the list, waiting, or hidden by its author. */
	const taken = $derived(
		new Set([...membership.members.map((m) => m.key), ...membership.pending.map((s) => s.company), ...(list?.hidden || [])])
	);

	// A list none of whose companies has jobs open opens on its companies, unless asked otherwise.
	let chosen = params.has('tab');
	$effect(() => {
		if (chosen || !list || !jobCounts().size) return;
		chosen = true;
		if (!listStats(membership.members.map((m) => m.key), jobCounts()).jobs) show = 'companies';
	});

	// What is shown stays in the address, to share or come back to.
	$effect(() => {
		const next = new URL(location.href);
		if (show === 'companies') next.searchParams.set('tab', 'companies');
		else next.searchParams.delete('tab');
		if (place && everywhere) next.searchParams.set('everywhere', '');
		else next.searchParams.delete('everywhere');
		if (next.href !== location.href) replaceState(next, {});
	});
</script>

<svelte:head><title>{list?.name || rkey} · {config.name}</title></svelte:head>

{#if list}
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
							<Icon name="jobs" /> {t('list.tab.jobs')} <small>{offers.toLocaleString()}</small>
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
							<Icon name="companies" /> {t('list.tab.companies')} <small>{companies.length.toLocaleString()}</small>
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
	{#if session.did && !mine}
		<Sheet bind:open={suggesting} label={t('suggestion.title')}>
			<ListSuggest {list} {taken} />
		</Sheet>
	{/if}
{:else if fetched === null}
	<h1>{t('list.notFoundTitle')}</h1>
	<p>{t('list.notFound')}</p>
	<menu><a href="/lists">{t('nav.lists')}</a></menu>
{:else}
	<Pending />
{/if}
