<script>
	import config from '#lib/data/config.json';
	import JobMarks from '#lib/components/JobMarks.svelte';
	import PageHeader from '#lib/components/PageHeader.svelte';
	import SavedSearches from '#lib/components/SavedSearches.svelte';
	import { savedJobs } from '#lib/network/saved-jobs.svelte.js';
	import { searches } from '#lib/network/saved-searches.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';
</script>

<svelte:head><title>{t('saved.title')} · {config.name}</title></svelte:head>

<PageHeader title={t('saved.title')} intro={t('saved.intro')} />
<section aria-labelledby="saved-searches">
	<h2 id="saved-searches">{t('saved.searches')}</h2>
	{#if searches.list.length}
		<SavedSearches jobs={savedJobs.jobs} names={savedJobs.names} />
	{:else}
		<p>{t('saved.empty')}</p>
		<p><a href="/">{t('saved.explore')}</a></p>
	{/if}
</section>
<section aria-labelledby="saved-applied">
	<h2 id="saved-applied">{t('marks.applied')}</h2>
	<JobMarks mark="applied" />
</section>
<section aria-labelledby="saved-hidden">
	<h2 id="saved-hidden">{t('marks.hidden')}</h2>
	<JobMarks mark="hidden" />
</section>
