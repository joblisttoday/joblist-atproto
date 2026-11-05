<script>
	import PageHeader from '#lib/components/PageHeader.svelte';
	import { page } from '$app/state';
	import config from '#lib/data/config.json';
	import Companies from '#lib/components/Companies.svelte';
	import CompanyMap from '#lib/components/CompanyMap.svelte';
	import Tabs from '#lib/components/Tabs.svelte';
	import { data } from '#lib/network/network.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	const tab = $derived(page.url.searchParams.get('tab') || 'companies');
	// A tag or place link can open this page already searched (?q=…).
	let query = $state(page.url.searchParams.get('q') || '');
	const companies = $derived([...data.companies.values()].sort((a, b) => a.name.localeCompare(b.name)));
</script>

<svelte:head><title>{t('companies.title')} · {config.name}</title></svelte:head>

<PageHeader title={t('companies.title')} intro={t('companies.intro')}>
	{#snippet actions()}<a href="/add">+ {t('companies.add')}</a>{/snippet}
</PageHeader>
<Tabs
	label={t('list.tabs')}
	tabs={[
		{ id: 'companies', label: t('list.tab.companies') },
		{ id: 'map', label: t('list.tab.map') }
	]}
	current={tab}
/>
{#if tab === 'map'}
	<CompanyMap {companies} />
{:else}
	<Companies {companies} bind:query />
{/if}
