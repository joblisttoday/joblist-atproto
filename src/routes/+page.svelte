<script>
	import { goto } from '$app/navigation';
	import config from '#lib/data/config.json';
	import Icon from '#lib/components/Icon.svelte';
	import Collect from '#lib/components/Collect.svelte';
	import MenuLinks from '#lib/components/MenuLinks.svelte';
	import PageHeader from '#lib/components/PageHeader.svelte';
	import SavedSearches from '#lib/components/SavedSearches.svelte';
	import { searchKeys } from '#lib/models/saved-search.js';
	import { signingIn } from '#lib/navigation/address.js';
	import { savedJobs } from '#lib/network/saved-jobs.svelte.js';
	import { searches } from '#lib/network/saved-searches.svelte.js';
	import { formatNumber, t } from '#lib/i18n/index.svelte.js';

	/**
	 * The home: what joblist is, your searches (kept in this browser) with their new jobs,
	 * and the ways in; the search is the header's, as on every page (jobs, organizations, places). The explorer is /jobs; an older link
	 * to a search here (/#q=design) goes on to it.
	 */
	const explorer = [...searchKeys, 'view', config.jobs.jobParam];
	$effect(() => {
		if (signingIn()) return;
		const hash = new URLSearchParams(location.hash.slice(1));
		const query = new URLSearchParams(location.search);
		if (explorer.some((key) => hash.has(key) || query.has(key))) goto(`/jobs${location.search}${location.hash}`, { replace: true });
	});

	const max = config.me.glance;

	/** @type {import('#lib/navigation/nav.js').MenuLink[]} */
	const ways = $derived([
		{ href: '/in', icon: 'place', label: t('landing.cities') },
		{ href: '/field', icon: 'jobs', label: t('landing.fields') },
		{ href: '/companies', icon: 'companies', label: t('nav.companies') }
	]);
</script>

<svelte:head><title>{config.name}</title></svelte:head>

<jl-home>
	<PageHeader title={t('home.heading')} intro={t('home.lead')} />

	<!-- The book of jobs: collect organizations, joblist finds what it can. -->
	<section aria-labelledby="home-collect">
		<h2 id="home-collect">{t('home.collect')}</h2>
		<p><small>{t('home.collect.intro')}</small></p>
		<Collect />
	</section>


	{#if searches.list.length}
		<section aria-labelledby="home-searches">
			<h2 id="home-searches"><a href="/me/searches">{t('saved.searches')}</a></h2>
			<SavedSearches jobs={savedJobs.jobs} names={savedJobs.names} {max} />
			{#if searches.list.length > max}<p><a href="/me/searches">{t('me.all', { count: formatNumber(searches.list.length) })} <Icon name="next" /></a></p>{/if}
		</section>
	{/if}

	<jl-home-ways><MenuLinks label={t('menu.explore')} items={ways} /></jl-home-ways>
</jl-home>

<style>
	jl-home {
		display: block;
		padding-bottom: var(--space-xl);
	}
	section {
		margin-top: var(--space-l);
	}
	jl-home-ways {
		display: block;
		margin-top: var(--space-l);
	}
	/* Wide screens: the ways in side by side, each its own box. */
	@media (min-width: 48rem) {
		jl-home-ways :global(menu) {
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			gap: var(--space-s);
			border: 0;
		}
		jl-home-ways :global(li) {
			border: var(--border);
			border-radius: var(--radius);
		}
	}
</style>
