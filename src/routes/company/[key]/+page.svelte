<script>
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import config from '#lib/data/config.json';
	import AddToList from '#lib/components/AddToList.svelte';
	import CompanyClaim from '#lib/components/CompanyClaim.svelte';
	import CompanyHeader from '#lib/components/CompanyHeader.svelte';
	import CompanyHiring from '#lib/components/CompanyHiring.svelte';
	import CompanyMap from '#lib/components/CompanyMap.svelte';
	import CompanyVersions from '#lib/components/CompanyVersions.svelte';
	import Jobs from '#lib/components/Jobs.svelte';
	import ListItem from '#lib/components/ListItem.svelte';
	import Pending from '#lib/components/Pending.svelte';
	import { data, listsWith, network } from '#lib/network/network.svelte.js';
	import { boardUrl, mapPoints } from '#lib/models/company.js';
	import { mixedAuthors } from '#lib/models/list.js';
	import { t } from '#lib/i18n/index.svelte.js';

	const key = $derived(page.params.key || '');
	const company = $derived(data.companies.get(key));
	// The same company added twice: its page is the kept one's.
	$effect(() => {
		if (company && company.key !== key) goto(`/company/${company.key}`, { replaceState: true });
	});
	const lists = $derived(listsWith(key));
	// Jobs come from its job board, or were posted here (by the company or anyone).
	const hasJobs = $derived(Boolean(company && (boardUrl(company.jobBoard) || data.postedJobs.has(key))));
	const places = $derived(
		(company?.locations || []).map((l) => [l.name, l.address, l.country].filter(Boolean).join(', ')).filter(Boolean)
	);
</script>

<svelte:head><title>{company?.name || key} · {config.name}</title></svelte:head>

{#if company}
	<jl-company-page verified={company.verified || undefined}>
		<CompanyHeader {company} />
		<CompanyClaim {company} />

		<section aria-labelledby="company-jobs">
			<h2 id="company-jobs">{t('list.tab.jobs')}</h2>
			<CompanyHiring {company} />
			{#if hasJobs}<Jobs companies={[company]} />{/if}
		</section>

		<section aria-labelledby="company-lists">
			<h2 id="company-lists">{t('company.inLists')}</h2>
			{#if lists.length}
				<ul>{#each lists as list (list.uri)}<li><ListItem {list} author={mixedAuthors(lists)} /></li>{/each}</ul>
			{:else}
				<p><small>{t('company.noLists')}</small></p>
			{/if}
			<AddToList {key} />
		</section>

		{#if places.length}
			<section aria-labelledby="company-places">
				<h2 id="company-places">{t('form.locations')}</h2>
				<ul>{#each places as place, i (i)}<li>{place}</li>{/each}</ul>
				{#if mapPoints(company).length}<CompanyMap companies={[company]} small />{/if}
			</section>
		{/if}

		<CompanyVersions {company} />
	</jl-company-page>
{:else if network.loading}
	<Pending />
{:else}
	<h1>{key}</h1>
	<p>{t('company.notFound', { key })}</p>
	<menu><a href="/add?url={encodeURIComponent(key)}">{t('company.describe')}</a></menu>
{/if}

<style>
	jl-company-page {
		display: block;
	}
	section {
		margin-top: var(--space-xl);
	}
	section > ul > li {
		padding: var(--space-xs) 0;
	}
</style>
