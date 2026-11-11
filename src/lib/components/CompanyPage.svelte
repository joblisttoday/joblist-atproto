<script>
	import CompanyClaim from './CompanyClaim.svelte';
	import CompanyEmbed from './CompanyEmbed.svelte';
	import CompanyHeader from './CompanyHeader.svelte';
	import CompanyHiring from './CompanyHiring.svelte';
	import CompanyInvite from './CompanyInvite.svelte';
	import CompanyMap from './CompanyMap.svelte';
	import CompanyJobs from './CompanyJobs.svelte';
	import Tabs from './Tabs.svelte';
	import { session } from '#lib/auth/session.svelte.js';
	import { data } from '#lib/network/network.svelte.js';
	import { ATPROTO, boardUrl, mapPoints } from '#lib/models/company.js';
	import { placeCounts } from '#lib/models/job.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * An organization's page, the same whether joblist knows it (/{domain}) or only
	 * this browser does (local: /me/organization#url=…, or a domain joblist does not know):
	 * its header, then its tabs, each its own address: its jobs (/{domain}: searched, by team,
	 * on a map, opened in a dialog; then "Is this your organization?" and its jobs on your
	 * site), and its places (/{domain}/places, on a map).
	 * A local one has no tabs: its jobs, then where they are (from its jobs); it is kept and
	 * suggested to joblist instead of edited.
	 * tab: the one shown. address: what its address keeps besides its jobs' search (a local one's #url=…).
	 * @type {{company: import('#lib/models/company.js').Company, local?: import('#lib/models/kept.js').Local, address?: Record<string, string>, tab?: 'jobs' | 'places'}}
	 */
	let { company, local, address = {}, tab = 'jobs' } = $props();
	const key = $derived(company.key);
	const manager = $derived(!local && session.handle === company.key);
	// Jobs come from its job board, or were posted here (by the company or anyone).
	const hasJobs = $derived(Boolean(boardUrl(company.jobBoard) || company.jobBoard?.provider === ATPROTO || (!local && data.postedJobs.has(key))));
	/** @type {import('#lib/ats/job.js').Job[]} */
	let jobs = $state.raw([]);
	const places = $derived(
		local
			? placeCounts(jobs, 5).map(([place]) => place)
			: (company.locations || []).map((l) => [l.name, l.address, l.country].filter(Boolean).join(', ')).filter(Boolean)
	);
	const tabs = $derived([
		{ path: '', icon: /** @type {const} */ ('jobs'), label: t('list.tab.jobs'), count: jobs.length || undefined },
		{ path: '/places', icon: /** @type {const} */ ('place'), label: t('form.locations'), count: places.length }
	]);
	const showJobs = $derived(Boolean(local) || tab === 'jobs');
	const showPlaces = $derived(Boolean(local) || tab === 'places');
</script>

<jl-company-page verified={company.verified || undefined} tabbed={!local || undefined}>
	<CompanyHeader {company} {local} />
	<!-- The organization writes its page: "Is this your organization?" first, or, signed in as it, what it can do. -->
	{#if !local}<CompanyClaim {company} />{/if}
	{#if !local}<Tabs base="/{key}" label={t('company.tabs')} {tabs} />{/if}

	{#if showJobs}
		<section aria-labelledby="company-jobs">
			<h2 id="company-jobs">{t('list.tab.jobs')}</h2>
			{#if !local}<CompanyHiring {company} />{/if}
			{#if hasJobs}
				<CompanyJobs {company} bind:jobs {address} local={Boolean(local)} />
			{:else if local}
				<p>{t('org.jobsThere')} <a href={local.link} target="_blank" rel="noopener noreferrer">{local.link.replace(/^https?:\/\/(www\.)?/, '')}</a></p>
			{/if}
		</section>
		{#if !local}
			<!-- Its jobs on a website, at hand. -->
			<jl-company-more>
				<CompanyEmbed {company} open={manager} />
			</jl-company-more>
		{/if}
	{/if}

	{#if showPlaces}
		<section aria-labelledby="company-places">
			<h2 id="company-places">{t('form.locations')}</h2>
			{#if places.length}
				<ul>{#each places as place, i (i)}<li>{place}</li>{/each}</ul>
				{#if mapPoints(company).length}<jl-company-map><CompanyMap companies={[company]} full /></jl-company-map>{/if}
			{:else if local}
				<p><small>{t(hasJobs ? 'org.noPlaces' : 'org.placesUnknown')}</small></p>
			{/if}
			{#if !local}<CompanyInvite {company} field="locations" />{/if}
		</section>
	{/if}

	{#if local}<p><small>{t('org.how')}</small></p>{/if}
</jl-company-page>

<style>
	jl-company-page {
		display: block;
	}
	jl-company-page > :global(jl-tabs) {
		margin-top: var(--space-m);
	}
	section {
		margin-top: var(--space-l);
	}
	h2 {
		font-size: var(--font-size-small);
		color: var(--color-muted);
	}
	/* Its tab already says what the section is: the heading stays for screen readers only. */
	jl-company-page[tabbed] section > h2 {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	section > ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	section > ul > li {
		padding: var(--space-xs) 0;
	}
	jl-company-more {
		display: grid;
		gap: var(--space-m);
		max-width: var(--reading-width);
		margin-top: var(--space-xl);
	}
	/* A page given to its places: a big map. */
	jl-company-map {
		display: block;
		height: var(--map-height);
		margin-top: var(--space-m);
	}
</style>
