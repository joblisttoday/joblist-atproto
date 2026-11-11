<script>
	import { goto } from '$app/navigation';
	import config from '#lib/data/config.json';
	import Icon from '#lib/components/Icon.svelte';
	import QuickSearch from '#lib/components/QuickSearch.svelte';
	import PageHeader from '#lib/components/PageHeader.svelte';
	import SavedSearches from '#lib/components/SavedSearches.svelte';
	import { searchKeys } from '#lib/models/saved-search.js';
	import { signingIn } from '#lib/navigation/address.js';
	import { savedJobs } from '#lib/network/saved-jobs.svelte.js';
	import { searches } from '#lib/network/saved-searches.svelte.js';
	import { formatNumber, t } from '#lib/i18n/index.svelte.js';

	/**
	 * The home, short: what joblist is, the one search (jobs, organizations, or a link to
	 * keep one), and your searches (kept in this browser) with their new jobs. The ways to
	 * browse are the Explore tab and the footer. The explorer is /jobs; an older
	 * link to a search here (/#q=design) goes on to it.
	 */
	const explorer = [...searchKeys, 'view', config.jobs.jobParam];
	$effect(() => {
		if (signingIn()) return;
		const hash = new URLSearchParams(location.hash.slice(1));
		const query = new URLSearchParams(location.search);
		if (explorer.some((key) => hash.has(key) || query.has(key))) goto(`/jobs${location.search}${location.hash}`, { replace: true });
	});

	const max = config.me.glance;
</script>

<svelte:head><title>{config.name}</title></svelte:head>

<jl-home>
	<PageHeader title={t('home.heading')} intro={t('home.lead')} />

	<QuickSearch inline />

	{#if searches.list.length}
		<section aria-labelledby="home-searches">
			<h2 id="home-searches"><a href="/me/searches">{t('saved.searches')}</a></h2>
			<SavedSearches jobs={savedJobs.jobs} names={savedJobs.names} {max} />
			{#if searches.list.length > max}<p><a href="/me/searches">{t('me.all', { count: formatNumber(searches.list.length) })} <Icon name="next" /></a></p>{/if}
		</section>
	{/if}
</jl-home>

<style>
	/* One column, as wide as reading: the field is not stretched across a desktop. */
	jl-home {
		display: block;
		max-width: var(--reading-width);
		padding-bottom: var(--space-xl);
	}
	section {
		margin-top: var(--space-l);
	}
</style>
