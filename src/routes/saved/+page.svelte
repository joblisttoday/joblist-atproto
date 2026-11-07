<script>
	import config from '#lib/data/config.json';
	import CollectionName from '#lib/components/CollectionName.svelte';
	import Empty from '#lib/components/Empty.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import JobCollection from '#lib/components/JobCollection.svelte';
	import PageHeader from '#lib/components/PageHeader.svelte';
	import SavedSearches from '#lib/components/SavedSearches.svelte';
	import { addCollection, kept } from '#lib/network/job-collections.svelte.js';
	import { savedJobs } from '#lib/network/saved-jobs.svelte.js';
	import { searches } from '#lib/network/saved-searches.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';
</script>

<svelte:head><title>{t('saved.title')} · {config.name}</title></svelte:head>

<!-- Profiles and moving collections to another device: /settings. -->
<PageHeader title={t('saved.title')} intro={t('saved.intro')}>
	{#snippet actions()}<a href="/settings"><Icon name="settings" label={t('settings.title')} /></a>{/snippet}
</PageHeader>
<!-- Wide screens: its parts side by side, in as many columns as fit. -->
<jl-saved>
	<section aria-labelledby="saved-searches">
		<h2 id="saved-searches">{t('saved.searches')}</h2>
		{#if searches.list.length}
			<SavedSearches jobs={savedJobs.jobs} names={savedJobs.names} />
		{:else}
			<Empty text={t('saved.empty')}><a href="/"><Icon name="search" /> {t('saved.explore')}</a></Empty>
		{/if}
	</section>
	{#each kept.state.collections as collection (collection.id)}
		<JobCollection {collection} />
	{/each}
	<section aria-labelledby="saved-new">
		<h2 id="saved-new">{t('collections.new')}</h2>
		<CollectionName submit={t('collections.create')} onsubmit={addCollection} />
	</section>
</jl-saved>

<style>
	jl-saved {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, var(--section-min)), 1fr));
		column-gap: var(--column-gap);
		align-items: start;
	}
</style>
