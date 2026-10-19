<script>
	import config from '#lib/data/config.json';
	import FeaturedJobs from './FeaturedJobs.svelte';
	import JobFilters from './JobFilters.svelte';
	import JobGroup from './JobGroup.svelte';
	import JobItem from './JobItem.svelte';
	import { getJobs } from '#lib/ats/index.js';
	import { mapLimit } from '#lib/atproto/xrpc.js';
	import { getSnapshotJobs } from '#lib/network/snapshot.js';
	import { boardUrl, hasJobsApi } from '#lib/models/company.js';
	import { byCompany, commonPlaces, filterJobs } from '#lib/models/job.js';
	import { mergeJobs, postedFirst } from '#lib/models/job-post.js';
	import { data } from '#lib/network/network.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/** @type {{companies: import('#lib/models/company.js').Company[]}} */
	let { companies } = $props();
	const PAGE = config.jobs.pageSize;

	/** Jobs read from job boards (or their snapshot). */
	/** @type {import('#lib/ats/job.js').Job[]} */
	let boardJobs = $state.raw([]);
	let answered = $state(0);
	let filters = $state({ query: '', where: '', remote: false });
	let grouped = $state(false);
	let shown = $state(PAGE);

	const targets = $derived(companies.filter(hasJobsApi));
	const loading = $derived(answered < targets.length);
	const single = $derived(companies.length === 1);
	const names = $derived(new Map(companies.map((c) => [c.key, c.name])));
	// Offers posted on joblist, for every company here (with a job board or not).
	const posted = $derived(companies.flatMap((c) => data.postedJobs.get(c.key) || []));
	const jobs = $derived(mergeJobs(posted, boardJobs));
	const withoutApi = $derived(companies.filter((c) => !hasJobsApi(c) && boardUrl(c.jobBoard)));
	// On a company's page, the offers it posted come first.
	const filtered = $derived(single ? postedFirst(filterJobs(jobs, filters, names)) : filterJobs(jobs, filters, names));
	const groups = $derived(grouped ? byCompany(filtered) : []);
	// Suggestions are computed once all boards answered, not on every answer.
	const places = $derived(loading ? [] : commonPlaces(jobs));

	$effect(() => {
		const list = targets;
		let cancelled = false;
		const seen = new Set();
		boardJobs = [];
		answered = 0;
		/** @param {import('#lib/ats/job.js').Job[]} found */
		const add = (found) => {
			const fresh = found.filter((j) => !seen.has(j.url) && seen.add(j.url));
			if (fresh.length) boardJobs = boardJobs.concat(fresh);
		};
		// Boards in the snapshot answer at once; only newer ones are asked live.
		getSnapshotJobs().then((snapshot) => {
			if (cancelled) return;
			const live = snapshot ? list.filter((c) => !snapshot.checked.has(c.key)) : list;
			if (snapshot) {
				add(list.flatMap((c) => snapshot.jobs.get(c.key) || []));
				answered = list.length - live.length;
			}
			mapLimit(live, config.limits.jobsConcurrency, async (company) => {
				const found = await getJobs(company);
				if (cancelled) return;
				add(found);
				answered++;
			});
		});
		return () => (cancelled = true);
	});
</script>

<jl-jobs loading={loading || undefined}>
	{#if loading}
		<progress value={answered} max={targets.length} aria-label={t('jobs.loading')}></progress>
	{/if}
	<FeaturedJobs {jobs} {names} {single} />
	<p aria-live="polite">
		<small>
			{#if loading}
				{t('jobs.progress', { answered, total: targets.length, count: jobs.length })}
			{:else if filtered.length === jobs.length}
				{t('jobs.count', { count: jobs.length })}
			{:else}
				{t('jobs.countFiltered', { count: filtered.length, total: jobs.length })}
			{/if}
		</small>
	</p>

	{#if jobs.length > 10}
		<JobFilters bind:filters bind:grouped {places} onchange={() => (shown = PAGE)} />
	{/if}

	{#if grouped}
		<ul>
			{#each groups as [key, list] (key)}
				<li><JobGroup {key} name={names.get(key) || key} jobs={list} /></li>
			{/each}
		</ul>
	{:else}
		<ul>
			{#each filtered.slice(0, shown) as job (job.url)}
				<li><JobItem {job} company={single ? undefined : names.get(job.company)} /></li>
			{/each}
		</ul>
		{#if filtered.length > shown}
			<button type="button" onclick={() => (shown += PAGE)}>
				{t('jobs.more', { count: Math.min(PAGE, filtered.length - shown), left: filtered.length - shown })}
			</button>
		{/if}
	{/if}

	{#if !loading && !filtered.length}
		<p>{jobs.length ? t('search.none') : t('jobs.none')}</p>
	{/if}

	{#if withoutApi.length}
		{#if single}
			<p>
				<a href={boardUrl(withoutApi[0].jobBoard)} target="_blank" rel="noopener">{t('jobs.careersPage')}</a>
				<small>{t('jobs.noBoard')}</small>
			</p>
		{:else}
			<details>
				<summary>{t('jobs.withoutBoard', { count: withoutApi.length })}</summary>
				<ul>
					{#each withoutApi as company (company.key)}
						<li><a href={boardUrl(company.jobBoard)} target="_blank" rel="noopener">{company.name}</a></li>
					{/each}
				</ul>
			</details>
		{/if}
	{/if}
</jl-jobs>

<style>
	jl-jobs {
		display: block;
	}
	jl-jobs > p {
		margin: var(--space-s) 0;
	}
	ul {
		margin: var(--space-s) 0;
	}
	details {
		border-bottom: var(--border);
	}
	details li > a {
		display: flex;
		align-items: center;
		min-height: var(--tap-size);
	}
	button {
		width: 100%;
		margin: var(--space-s) 0;
	}
	progress {
		margin-top: var(--space-s);
	}
</style>
