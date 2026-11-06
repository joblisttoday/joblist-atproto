<script>
	import config from '#lib/data/config.json';
	import PageHeader from '#lib/components/PageHeader.svelte';
	import SavedSearches from '#lib/components/SavedSearches.svelte';
	import { data } from '#lib/network/network.svelte.js';
	import { getSnapshotJobs } from '#lib/network/snapshot.js';
	import { searches } from '#lib/network/saved-searches.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	const names = $derived(new Map([...data.companies.values()].map((c) => [c.key, c.name])));
	// The jobs as of the last snapshot, and those posted here: enough to count what is new.
	/** @type {import('#lib/ats/job.js').Job[]} */
	let boardJobs = $state.raw([]);
	getSnapshotJobs().then((snapshot) => {
		if (snapshot) boardJobs = [...snapshot.jobs.values()].flat();
	});
	const jobs = $derived([...[...data.postedJobs.values()].flat(), ...boardJobs]);
</script>

<svelte:head><title>{t('saved.title')} · {config.name}</title></svelte:head>

<PageHeader title={t('saved.title')} intro={t('saved.intro')} />
{#if searches.list.length}
	<SavedSearches {jobs} {names} />
{:else}
	<p>{t('saved.empty')}</p>
	<p><a href="/">{t('saved.explore')}</a></p>
{/if}
