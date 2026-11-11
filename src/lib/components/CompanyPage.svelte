<script>
	import CompanyClaim from './CompanyClaim.svelte';
	import CompanyEmbed from './CompanyEmbed.svelte';
	import CompanyHeader from './CompanyHeader.svelte';
	import CompanyHiring from './CompanyHiring.svelte';
	import CompanyInvite from './CompanyInvite.svelte';
	import CompanyMap from './CompanyMap.svelte';
	import CompanyVersions from './CompanyVersions.svelte';
	import CompanyJobs from './CompanyJobs.svelte';
	import { session } from '#lib/auth/session.svelte.js';
	import { data } from '#lib/network/network.svelte.js';
	import { boardUrl, mapPoints } from '#lib/models/company.js';
	import { placeCounts } from '#lib/models/job.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * An organization's page, the same whether joblist knows it (/{domain}) or only
	 * this browser does (local: /me/organization#url=…, or a domain joblist does not know):
	 * its header, its jobs (searched, by team, on a map, opened in a dialog), and at the side
	 * where it is. One joblist knows also has its versions and "Is this your
	 * organization?"; a local one is kept and suggested to joblist instead of edited, and
	 * where it is comes from its jobs.
	 * address: what its address keeps besides its jobs' search (a local one's #url=…).
	 * @type {{company: import('#lib/models/company.js').Company, local?: import('#lib/models/kept.js').Local, address?: Record<string, string>}}
	 */
	let { company, local, address = {} } = $props();
	const key = $derived(company.key);
	const manager = $derived(!local && session.handle === company.key);
	// Jobs come from its job board, or were posted here (by the company or anyone).
	const hasJobs = $derived(Boolean(boardUrl(company.jobBoard) || (!local && data.postedJobs.has(key))));
	/** @type {import('#lib/ats/job.js').Job[]} */
	let jobs = $state.raw([]);
	const places = $derived(
		local
			? placeCounts(jobs, 5).map(([place]) => place)
			: (company.locations || []).map((l) => [l.name, l.address, l.country].filter(Boolean).join(', ')).filter(Boolean)
	);
</script>

<!-- Wide screens: the company and its jobs, then at the side where it is. -->
<jl-company-page verified={company.verified || undefined}>
	<jl-company-main>
		<CompanyHeader {company} {local} />
		<!-- The company itself first sees what it can do; anyone else finds "Is this your organization?" after the jobs. -->
		{#if manager}<CompanyClaim {company} />{/if}

		<section aria-labelledby="company-jobs">
			<h2 id="company-jobs">{t('list.tab.jobs')}</h2>
			{#if !local}<CompanyHiring {company} />{/if}
			{#if hasJobs}
				<CompanyJobs {company} bind:jobs {address} local={Boolean(local)} />
			{:else if local}
				<p>{t('org.jobsThere')} <a href={local.link} target="_blank" rel="noopener noreferrer">{local.link.replace(/^https?:\/\/(www\.)?/, '')}</a></p>
			{/if}
		</section>
		<!-- Its own account: its jobs on its own site, at hand. -->
		{#if manager}<CompanyEmbed {company} open />{/if}
	</jl-company-main>

	<aside>
		<section aria-labelledby="company-places">
			<h2 id="company-places">{t('form.locations')}</h2>
			{#if places.length}
				<ul>{#each places as place, i (i)}<li>{place}</li>{/each}</ul>
				{#if mapPoints(company).length}<CompanyMap companies={[company]} small />{/if}
			{:else if local}
				<p><small>{t(hasJobs ? 'org.noPlaces' : 'org.placesUnknown')}</small></p>
			{/if}
			{#if !local}<CompanyInvite {company} field="locations" />{/if}
		</section>

		{#if local}
			<p><small>{t('org.how')}</small></p>
		{:else}
			{#if !manager}<CompanyClaim {company} />{/if}
			{#if !manager}<CompanyEmbed {company} />{/if}
			<CompanyVersions {company} />
		{/if}
	</aside>
</jl-company-page>

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
