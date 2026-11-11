<script>
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import config from '#lib/data/config.json';
	import CompanyPage from '#lib/components/CompanyPage.svelte';
	import DataState from '#lib/components/DataState.svelte';
	import OrganizationProfile from '#lib/components/OrganizationProfile.svelte';
	import { keptUrl, keyOf } from '#lib/models/kept.js';
	import { data } from '#lib/network/network.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * An organization's page (CompanyPage); a domain joblist does not know yet has the same
	 * page, with what this browser finds of it (OrganizationProfile).
	 */
	const key = $derived(page.params.key || '');
	const company = $derived(data.companies.get(key));
	// The same company added twice: its page is the kept one's.
	$effect(() => {
		if (company && company.key !== key) goto(`/company/${company.key}`, { replace: true });
	});
</script>

<svelte:head><title>{company?.name || key} · {config.name}</title></svelte:head>

{#if company}
	<CompanyPage {company} />
{:else if data.status !== 'known'}
	<DataState />
{:else}
	{@const link = keptUrl(key)}
	{#if link && keyOf(link) === key}
		<!-- A domain joblist does not know: the same page, with what this browser finds of it. -->
		<OrganizationProfile {link} />
	{:else}
		<h1>{key}</h1>
		<p>{t('company.notFound', { key })}</p>
		<menu><a href="/add?url={encodeURIComponent(key)}">{t('company.describe')}</a></menu>
	{/if}
{/if}
