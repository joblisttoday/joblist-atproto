<script>
	import Companies from '#lib/components/Companies.svelte';
	import CompanyMap from '#lib/components/CompanyMap.svelte';
	import NetworkStatus from '#lib/components/NetworkStatus.svelte';
	import Tabs from '#lib/components/Tabs.svelte';
	import { data } from '#lib/network/network.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	let tab = $state('companies');
	const companies = $derived([...data.companies.values()].sort((a, b) => a.name.localeCompare(b.name)));
</script>

<h1>{t('nav.companies')}</h1>
<NetworkStatus />
<Tabs
	tabs={[
		{ id: 'companies', label: t('list.tab.companies') },
		{ id: 'map', label: t('list.tab.map') }
	]}
	bind:current={tab}
/>
{#if tab === 'map'}
	<CompanyMap {companies} />
{:else}
	<Companies {companies} />
{/if}
