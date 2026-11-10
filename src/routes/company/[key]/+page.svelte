<script>
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import config from '#lib/data/config.json';
	import AddToList from '#lib/components/AddToList.svelte';
	import CompanyClaim from '#lib/components/CompanyClaim.svelte';
	import CompanyEmbed from '#lib/components/CompanyEmbed.svelte';
	import CompanyHeader from '#lib/components/CompanyHeader.svelte';
	import CompanyHiring from '#lib/components/CompanyHiring.svelte';
	import CompanyInvite from '#lib/components/CompanyInvite.svelte';
	import CompanyMap from '#lib/components/CompanyMap.svelte';
	import CompanyVersions from '#lib/components/CompanyVersions.svelte';
	import CompanyJobs from '#lib/components/CompanyJobs.svelte';
	import DataState from '#lib/components/DataState.svelte';
	import Empty from '#lib/components/Empty.svelte';
	import ListItem from '#lib/components/ListItem.svelte';
	import { session } from '#lib/auth/session.svelte.js';
	import { data, listsWith } from '#lib/network/network.svelte.js';
	import { boardUrl, mapPoints } from '#lib/models/company.js';
	import { mixedAuthors } from '#lib/models/list.js';
	import { t } from '#lib/i18n/index.svelte.js';

	const key = $derived(page.params.key || '');
	const company = $derived(data.companies.get(key));
	// The same company added twice: its page is the kept one's.
	$effect(() => {
		if (company && company.key !== key) goto(`/company/${company.key}`, { replace: true });
	});
	const lists = $derived(listsWith(key));
	const manager = $derived(Boolean(company) && session.handle === company?.key);
	// Jobs come from its job board, or were posted here (by the company or anyone).
	const hasJobs = $derived(Boolean(company && (boardUrl(company.jobBoard) || data.postedJobs.has(key))));
	const places = $derived(
		(company?.locations || []).map((l) => [l.name, l.address, l.country].filter(Boolean).join(', ')).filter(Boolean)
	);
</script>

<svelte:head><title>{company?.name || key} · {config.name}</title></svelte:head>

{#if company}
	<!-- Wide screens: the company and its jobs, then at the side where it is and the lists it is in. -->
	<jl-company-page verified={company.verified || undefined}>
		<jl-company-main>
			<CompanyHeader {company} />
			<!-- The company itself first sees what it can do; anyone else finds "Is this your organization?" after the jobs. -->
			{#if manager}<CompanyClaim {company} />{/if}

			<section aria-labelledby="company-jobs">
				<h2 id="company-jobs">{t('list.tab.jobs')}</h2>
				<CompanyHiring {company} />
				{#if hasJobs}<CompanyJobs {company} />{/if}
			</section>
			<!-- Its own account: its jobs on its own site, at hand. -->
			{#if manager}<CompanyEmbed {company} open />{/if}
		</jl-company-main>

		<aside>
			<section aria-labelledby="company-lists">
				<h2 id="company-lists">{t('company.inLists')}</h2>
				{#if lists.length}
					<ul>{#each lists as list (list.uri)}<li><ListItem {list} author={mixedAuthors(lists)} /></li>{/each}</ul>
				{:else}
					<Empty text={t('company.noLists')} />
				{/if}
				<AddToList {key} />
			</section>

			<section aria-labelledby="company-places">
				<h2 id="company-places">{t('form.locations')}</h2>
				{#if places.length}
					<ul>{#each places as place, i (i)}<li>{place}</li>{/each}</ul>
					{#if mapPoints(company).length}<CompanyMap companies={[company]} small />{/if}
				{/if}
				<CompanyInvite {company} field="locations" />
			</section>

			{#if !manager}<CompanyClaim {company} />{/if}
			{#if !manager}<CompanyEmbed {company} />{/if}
			<CompanyVersions {company} />
		</aside>
	</jl-company-page>
{:else if data.status !== 'known'}
	<DataState />
{:else}
	<h1>{key}</h1>
	<p>{t('company.notFound', { key })}</p>
	<menu><a href="/add?url={encodeURIComponent(key)}">{t('company.describe')}</a></menu>
{/if}

<style>
	jl-company-page,
	jl-company-main {
		display: block;
	}
	section {
		margin-top: var(--space-xl);
	}
	aside > :global(*) {
		margin-top: var(--space-l);
	}
	/* Wide screens: the jobs take the width, the rest is at the side. */
	@media (min-width: 64rem) {
		jl-company-page {
			display: grid;
			grid-template-columns: minmax(0, 1fr) var(--aside-width);
			column-gap: var(--gutter);
			align-items: start;
		}
		aside {
			position: sticky;
			top: var(--header-height);
			max-height: calc(100dvh - var(--header-height));
			overflow-y: auto;
			padding-bottom: var(--space-l);
		}
	}
	section > ul > li {
		padding: var(--space-xs) 0;
	}
</style>
