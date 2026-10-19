<script>
	import JobItem from './JobItem.svelte';
	import { isJob, pickFeatured } from '#lib/models/featured.js';
	import { featured, loadFeatured } from '#lib/network/featured.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * The paid "Featured" block above a job list: only jobs that are in
	 * this list already, at most a few, taking turns. It changes nothing below.
	 * @type {{jobs: import('#lib/ats/job.js').Job[], names: Map<string, string>, single?: boolean}}
	 */
	let { jobs, names, single = false } = $props();

	loadFeatured();

	const shown = $derived(
		pickFeatured(
			featured.items.flatMap((item) => {
				const job = jobs.find((j) => isJob(item.job, j));
				return job ? [{ paidAt: item.paidAt, id: item.id, job }] : [];
			})
		)
	);
</script>

{#if shown.length}
	<jl-featured-jobs>
		<section aria-labelledby="featured-jobs">
			<h2 id="featured-jobs">{t('featured.label')}</h2>
			<ul>
				{#each shown as { id, job } (id)}
					<li><JobItem {job} company={single ? undefined : names.get(job.company)} /></li>
				{/each}
			</ul>
			<p><small><a href="/featured">{t('featured.what')}</a></small></p>
		</section>
	</jl-featured-jobs>
{/if}

<style>
	jl-featured-jobs {
		display: block;
		margin: var(--space-m) 0;
		padding: 0 var(--space-m);
		border: var(--border);
		border-radius: var(--radius);
		background: var(--color-soft);
	}
	h2 {
		margin: var(--space-s) 0 0;
		font-size: var(--font-size-small);
		font-weight: normal;
		color: var(--color-muted);
	}
	li:last-child > :global(jl-job) {
		border-bottom: none;
	}
	p {
		margin: 0 0 var(--space-s);
	}
</style>
