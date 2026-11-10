<script>
	import config from '#lib/data/config.json';
	import Empty from '#lib/components/Empty.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import PageHeader from '#lib/components/PageHeader.svelte';
	import SavedSearches from '#lib/components/SavedSearches.svelte';
	import { savedJobs } from '#lib/network/saved-jobs.svelte.js';
	import { searches } from '#lib/network/saved-searches.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/** Every search kept in this browser, with its new jobs: each opens in the explorer. */
</script>

<svelte:head><title>{t('me.searches.title')} · {config.name}</title></svelte:head>

<jl-me-searches>
	<PageHeader title={t('me.searches.title')} intro={t('searches.private')} />
	{#if searches.list.length}
		<SavedSearches jobs={savedJobs.jobs} names={savedJobs.names} />
	{:else}
		<Empty text={t('saved.empty')}><a href="/"><Icon name="search" /> {t('saved.explore')}</a></Empty>
	{/if}
</jl-me-searches>

<style>
	jl-me-searches {
		display: block;
		max-width: var(--reading-width);
		margin-inline: auto;
		padding-bottom: var(--space-xl);
	}
</style>
