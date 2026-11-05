<script>
	import PageHeader from '#lib/components/PageHeader.svelte';
	import config from '#lib/data/config.json';
	import Jobs from '#lib/components/Jobs.svelte';
	import SavedSearches from '#lib/components/SavedSearches.svelte';
	import SaveSearch from '#lib/components/SaveSearch.svelte';
	import { replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import { fromParams, sameSearch, toParams } from '#lib/models/saved-search.js';
	import { markSeen, searches } from '#lib/network/saved-searches.svelte.js';
	import { data } from '#lib/network/network.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	const companies = $derived([...data.companies.values()]);
	const names = $derived(new Map(companies.map((c) => [c.key, c.name])));
	// The search lives in the page address, so any search is a link to keep or share.
	let filters = $state(fromParams(page.url.searchParams));
	let since = $state('');
	/** @type {import('#lib/ats/job.js').Job[]} */
	let jobs = $state.raw([]);

	/** @param {import('#lib/models/saved-search.js').SavedSearch} search */
	function open(search) {
		since = search.seen;
		filters = { query: search.query, where: search.where, remote: search.remote };
		markSeen(search);
	}

	// Opened from a kept link: its new jobs are marked, once.
	const arrived = searches.list.find((s) => sameSearch(s, filters));
	if (arrived) open(arrived);

	// A shallow replace changes the address, not page.url: compare with the location.
	$effect(() => {
		const search = toParams(filters);
		if (search !== location.search) replaceState(`/jobs${search}`, {});
	});
</script>

<svelte:head><title>{t('jobs.title')} · {config.name}</title></svelte:head>

<PageHeader title={t('jobs.title')} intro={t('jobs.intro')}>
	{#snippet actions()}<a href="/jobs/new">+ {t('post.title')}</a>{/snippet}
</PageHeader>
<SavedSearches {jobs} {names} onopen={open} />
{#if companies.length}
	<Jobs {companies} careers={false} bind:filters bind:jobs {since}>
		{#snippet actions()}<SaveSearch {filters} />{/snippet}
	</Jobs>
{/if}
