<script>
	import config from '#lib/data/config.json';
	import { getJobs } from '#lib/ats/index.js';
	import { mapLimit } from '#lib/atproto/xrpc.js';
	import { boardUrl, hasJobsApi } from '#lib/models/company.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/** @type {{companies: import('#lib/models/company.js').Company[]}} */
	let { companies } = $props();

	/** @type {import('#lib/ats/job.js').Job[]} */
	let jobs = $state([]);
	let loading = $state(false);
	let query = $state('');

	const names = $derived(new Map(companies.map((c) => [c.key, c.name])));
	const withoutApi = $derived(companies.filter((c) => !hasJobsApi(c) && boardUrl(c.jobBoard)));

	$effect(() => {
		const targets = companies.filter(hasJobsApi);
		let cancelled = false;
		loading = true;
		jobs = [];
		mapLimit(targets, config.limits.jobsConcurrency, async (company) => {
			const found = await getJobs(company);
			if (!cancelled) jobs = [...jobs, ...found];
		}).finally(() => {
			if (!cancelled) loading = false;
		});
		return () => (cancelled = true);
	});

	const filtered = $derived.by(() => {
		const words = query.toLowerCase().split(/\s+/).filter(Boolean);
		return jobs
			.filter((j) => {
				const text = `${j.title} ${j.location || ''} ${j.department || ''} ${names.get(j.company) || ''}`.toLowerCase();
				return words.every((w) => text.includes(w));
			})
			.sort((a, b) => String(b.published || '').localeCompare(String(a.published || '')));
	});
</script>

<jl-jobs loading={loading || undefined}>
	<input type="search" bind:value={query} placeholder={t('jobs.filter')} aria-label={t('jobs.filter')} />
	<small>{loading ? t('jobs.loading') : t('jobs.count', { count: filtered.length })}</small>
	{#if !loading && !jobs.length && !withoutApi.length}
		<p>{t('jobs.none')}</p>
	{/if}
	<ul>
		{#each filtered.slice(0, 300) as job (job.url)}
			<li>
				<a href={job.url} target="_blank" rel="noopener">{job.title}</a>
				<small>
					{#if companies.length > 1}<a href="/company/{job.company}">{names.get(job.company)}</a>{job.location ? ' · ' : ''}{/if}{job.location || ''}
				</small>
			</li>
		{/each}
	</ul>
	{#if withoutApi.length}
		<ul>
			{#each withoutApi as company (company.key)}
				<li>
					<a href={boardUrl(company.jobBoard)} target="_blank" rel="noopener">{company.name}</a>
					<small>{t('jobs.noBoard')}</small>
				</li>
			{/each}
		</ul>
	{/if}
</jl-jobs>

<style>
	jl-jobs {
		display: block;
	}
	li {
		padding: var(--space-s) 0;
		border-bottom: var(--border);
	}
	li > a {
		font-weight: 600;
		text-decoration: none;
	}
	li small {
		display: block;
	}
	small {
		display: block;
		margin: var(--space-s) 0;
	}
</style>
