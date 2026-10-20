<script>
	import { page } from '$app/state';
	import config from '#lib/data/config.json';
	import Companies from '#lib/components/Companies.svelte';
	import CompanyMap from '#lib/components/CompanyMap.svelte';
	import Jobs from '#lib/components/Jobs.svelte';
	import ListHeader from '#lib/components/ListHeader.svelte';
	import ListPending from '#lib/components/ListPending.svelte';
	import ListSuggest from '#lib/components/ListSuggest.svelte';
	import Pending from '#lib/components/Pending.svelte';
	import SuggestionCredit from '#lib/components/SuggestionCredit.svelte';
	import Tabs from '#lib/components/Tabs.svelte';
	import { session } from '#lib/auth/session.svelte.js';
	import { data, handleOf, membersOf, network } from '#lib/network/network.svelte.js';
	import { loadList } from '#lib/network/load-list.js';
	import { t } from '#lib/i18n/index.svelte.js';

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

	// ?suggest opens "Suggest a company" (?suggest=key: back from describing it, or from signing in).
	let suggesting = $state(page.url.searchParams.has('suggest'));
	const tab = $derived(page.url.searchParams.get('tab') || 'companies');
	const membership = $derived(list ? membersOf(list) : { members: [], pending: [] });
	const companies = $derived(
		membership.members.map((m) => data.companies.get(m.key)).filter((c) => c !== undefined)
	);
	const missing = $derived(membership.members.length - companies.length);
	/** Who suggested each company added to an open list. */
	const credits = $derived(new Map(membership.members.flatMap((m) => (m.suggestion ? [[m.key, m.suggestion]] : []))));
	const mine = $derived(Boolean(list && session.did === list.did));
	/** Companies that cannot be suggested again: in the list, waiting, or hidden by its author. */
	const taken = $derived(
		new Set([...membership.members.map((m) => m.key), ...membership.pending.map((s) => s.company), ...(list?.hidden || [])])
	);
</script>

<svelte:head><title>{list?.name || rkey} · {config.name}</title></svelte:head>

{#if list}
	<jl-list-page>
		<ListHeader {list} count={membership.members.length} bind:suggesting />

		{#if mine && membership.pending.length}<ListPending {list} pending={membership.pending} />{/if}
		{#if suggesting && session.did && !mine}<ListSuggest {list} {taken} onclose={() => (suggesting = false)} />{/if}

		<Tabs
			label={t('list.tabs')}
			tabs={[
				{ id: 'companies', label: t('list.tab.companies') },
				{ id: 'jobs', label: t('list.tab.jobs') },
				{ id: 'map', label: t('list.tab.map') }
			]}
			current={tab}
		/>

		{#if tab === 'jobs'}
			<Jobs {companies} />
		{:else if tab === 'map'}
			<CompanyMap {companies} />
		{:else}
			<Companies {companies} searchable={companies.length > 10}>
				{#snippet aside(company)}
					{@const suggestion = credits.get(company.key)}
					{#if suggestion}<SuggestionCredit {list} {suggestion} />{/if}
				{/snippet}
			</Companies>
		{/if}
		{#if missing > 0}<p><small>{t('list.missing', { count: missing })}</small></p>{/if}
	</jl-list-page>
{:else if fetched === null}
	<h1>{t('list.notFoundTitle')}</h1>
	<p>{t('list.notFound')}</p>
	<menu><a href="/">{t('nav.lists')}</a></menu>
{:else}
	<Pending />
{/if}

<style>
	jl-list-page {
		display: block;
	}
</style>
