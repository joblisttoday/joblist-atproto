<script>
	import Icon from './Icon.svelte';
	import config from '#lib/data/config.json';
	import JobItem from './JobItem.svelte';
	import { distanceKm } from '#lib/models/distance.js';
	import { postPath } from '#lib/models/job-post.js';
	import { markOf, toggleMark } from '#lib/network/job-marks.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * One job open in the explorer: unfolded, then the other jobs closest to it.
	 * @type {{
	 *   job: import('#lib/ats/job.js').Job,
	 *   jobs: import('#lib/ats/job.js').Job[],
	 *   names: Map<string, string>,
	 *   onback: () => void,
	 *   onselect: (job: import('#lib/ats/job.js').Job) => void
	 * }}
	 */
	let { job, jobs, names, onback, onselect } = $props();

	const name = $derived(names.get(job.company) || job.company);
	// Applying comes first: on the job board, or on the offer's page when it was posted here.
	const apply = $derived(job.posted ? postPath(job.posted.did, job.posted.rkey) : job.url);
	const mark = $derived(markOf(job));

	// A hidden job leaves the results: back to them.
	function hide() {
		toggleMark(job, 'hidden', name);
		onback();
	}

	const nearby = $derived.by(() => {
		const from = job.point;
		if (!from) return [];
		return jobs
			.filter((other) => other.point && other.url !== job.url)
			.map((other) => ({ other, km: distanceKm(from, /** @type {[number, number]} */ (other.point)) }))
			.sort((a, b) => a.km - b.km)
			.slice(0, config.jobs.nearbyShown)
			.map(({ other }) => other);
	});
</script>

<jl-job-detail>
	<button type="button" onclick={onback} {@attach (node) => node.focus({ preventScroll: true })}><Icon name="back" /> {t('explore.back')}</button>
	{#key job.url}
		<JobItem {job} company={name} expanded>
			{#snippet actions()}
				<menu>
					<a href={apply} target={job.posted ? undefined : '_blank'} rel={job.posted ? undefined : 'noopener'}>{t('explore.apply')}{#if !job.posted}<Icon name="external" />{/if}</a>
					<button type="button" aria-pressed={mark === 'applied'} onclick={() => toggleMark(job, 'applied', name)}><Icon name="applied" /> {t(mark === 'applied' ? 'marks.applied' : 'marks.apply')}</button>
					<button type="button" onclick={hide}><Icon name="hide" /> {t('marks.hide')}</button>
				</menu>
			{/snippet}
		</JobItem>
	{/key}
	{#if nearby.length}
		<section aria-labelledby="job-nearby">
			<h2 id="job-nearby">{t('explore.nearby')}</h2>
			<ul>
				{#each nearby as other (other.url)}
					<li><JobItem job={other} company={names.get(other.company)} onselect={() => onselect(other)} /></li>
				{/each}
			</ul>
		</section>
	{/if}
</jl-job-detail>

<style>
	jl-job-detail {
		display: block;
	}
	jl-job-detail > button {
		min-height: var(--chip-height);
		padding: 0 var(--space-m);
		border-radius: var(--radius-round);
		font-size: var(--font-size-small);
		margin: var(--space-xs) 0 var(--space-s);
	}
	/* Apply: the page's main action, kept in reach under the handle while the job is read. */
	jl-job-detail :global(details > menu) {
		position: sticky;
		top: var(--handle-height);
		z-index: 1;
		padding-block: var(--space-s);
		background: var(--color-bg);
	}
	jl-job-detail :global(details > menu > a:first-child) {
		background: var(--color-accent);
		color: var(--color-accent-fg);
		border-color: var(--color-accent);
	}
	jl-job-detail :global(details > menu > a:first-child:hover) {
		background: var(--color-accent);
		opacity: 0.85;
	}
	jl-job-detail :global(details > menu > button[aria-pressed='true']) {
		background: var(--color-soft);
		color: var(--color-ok);
	}
	h2 {
		margin-top: var(--space-l);
	}
</style>
