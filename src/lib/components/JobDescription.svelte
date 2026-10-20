<script>
	import { getDescription } from '#lib/ats/index.js';
	import { data } from '#lib/network/network.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * A job board job's description, read live from its board, as plain text.
	 * company: the company's name, to link its page (left out on that page).
	 * @type {{job: import('#lib/ats/job.js').Job, company?: string}}
	 */
	let { job, company } = $props();
	const text = $derived(getDescription(data.companies.get(job.company), job));
	/** @param {string} value */
	const paragraphs = (value) => value.split(/\n{2,}/).filter((p) => p.trim());
	// The same offer at its other places, one link per place.
	const elsewhere = $derived(
		(job.also || []).filter((j, i, all) => j.location && j.location !== job.location && all.findIndex((k) => k.location === j.location) === i)
	);
</script>

<jl-job-description>
	{#await text}
		<p><small>{t('job.description.loading')}</small></p>
	{:then value}
		{#each paragraphs(value) as paragraph, i (i)}<p>{paragraph}</p>{:else}<p><small>{t('job.description.none')}</small></p>{/each}
	{/await}
	<menu>
		<a href={job.url} target="_blank" rel="noopener">{t('job.offer')}{elsewhere.length && job.location ? `: ${job.location}` : ''} ↗</a>
		{#each elsewhere as other (other.url)}<a href={other.url} target="_blank" rel="noopener">{other.location} ↗</a>{/each}
		{#if company}<a href="/company/{job.company}">{t('jobs.aboutCompany', { name: company })}</a>{/if}
	</menu>
</jl-job-description>

<style>
	jl-job-description {
		display: block;
		margin-top: var(--space-s);
	}
	p {
		white-space: pre-line;
	}
	menu {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-s) var(--space-l);
		margin: var(--space-s) 0 0;
		padding: 0;
	}
	menu a {
		display: inline-flex;
		align-items: center;
		min-height: var(--tap-size);
	}
</style>
