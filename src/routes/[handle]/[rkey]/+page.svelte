<script>
	import { page } from '$app/state';
	import config from '#lib/data/config.json';
	import Companies from '#lib/components/Companies.svelte';
	import CompanyMap from '#lib/components/CompanyMap.svelte';
	import Jobs from '#lib/components/Jobs.svelte';
	import ListHeader from '#lib/components/ListHeader.svelte';
	import NetworkStatus from '#lib/components/NetworkStatus.svelte';
	import Tabs from '#lib/components/Tabs.svelte';
	import { data, handleOf, network } from '#lib/network/network.svelte.js';
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

	const tab = $derived(page.url.searchParams.get('tab') || 'companies');
	const companies = $derived(
		(list?.companies || []).map((key) => data.companies.get(key)).filter((c) => c !== undefined)
	);
	const missing = $derived((list?.companies.length || 0) - companies.length);
</script>

<svelte:head><title>{list?.name || rkey} · {config.name}</title></svelte:head>

{#if list}
	<jl-list-page>
		<ListHeader {list} />

		<Tabs
			label={t('list.tabs')}
			tabs={[
				{ id: 'companies', label: t('list.tab.companies'), count: companies.length },
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
			<Companies {companies} searchable={companies.length > 10} />
		{/if}
		{#if missing > 0}<p><small>{t('list.missing', { count: missing })}</small></p>{/if}
	</jl-list-page>
{:else if fetched === null}
	<h1>{t('list.notFoundTitle')}</h1>
	<p>{t('list.notFound')}</p>
	<menu><a href="/">{t('nav.lists')}</a></menu>
{:else}
	<NetworkStatus />
{/if}

<style>
	jl-list-page {
		display: block;
	}
</style>
