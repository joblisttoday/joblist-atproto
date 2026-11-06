<script>
	import Icon from './Icon.svelte';
	import config from '#lib/data/config.json';
	import CompanyMap from './CompanyMap.svelte';
	import JobItem from './JobItem.svelte';
	import { distanceKm } from '#lib/models/distance.js';
	import { offerCount } from '#lib/models/job.js';
	import { postPath } from '#lib/models/job-post.js';
	import { markOf, toggleMark } from '#lib/network/job-marks.svelte.js';
	import { accountOf, thumbnail } from '#lib/network/accounts.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * One job open in the explorer, read on the whole page: the offer, then beside it
	 * (under it on phones) its company, where it is and the other jobs closest to it.
	 * @type {{
	 *   job: import('#lib/ats/job.js').Job,
	 *   jobs: import('#lib/ats/job.js').Job[],
	 *   all: import('#lib/ats/job.js').Job[],
	 *   names: Map<string, string>,
	 *   onback: () => void,
	 *   onselect: (job: import('#lib/ats/job.js').Job) => void
	 * }}
	 *   jobs: the results it was opened from (its neighbours are among them); all: every job read.
	 */
	let { job, jobs, all, names, onback, onselect } = $props();

	const name = $derived(names.get(job.company) || job.company);
	// Applying comes first: on the job board, or on the offer's page when it was posted here.
	const apply = $derived(job.posted ? postPath(job.posted.did, job.posted.rkey) : job.url);
	const mark = $derived(markOf(job));
	const avatar = $derived(accountOf(job.company)?.avatar);
	const atCompany = $derived(offerCount(all.filter((other) => other.company === job.company)));
	const place = $derived(
		job.point ? [{ lon: job.point[0], lat: job.point[1], company: { key: job.company, name } }] : null
	);

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
	<jl-job-read>
		<article>
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
		</article>
		<aside>
			<section aria-labelledby="job-company">
				<h2 id="job-company">
					{#if avatar}<img src={thumbnail(avatar)} alt="" />{/if}
					<a href="/company/{job.company}">{name}</a>
				</h2>
				{#if atCompany > 1}
					<p><a href="/company/{job.company}">{t('job.company.more', { count: atCompany.toLocaleString(), name })}</a></p>
				{:else if atCompany === 1}
					<p><small>{t('job.company.one', { name })}</small></p>
				{/if}
			</section>
			{#if place}
				<section aria-labelledby="job-where">
					<h2 id="job-where">{t('job.where')}</h2>
					{#if job.location}<p><small>{job.location}</small></p>{/if}
					{#key job.url}<CompanyMap places={place} small />{/key}
				</section>
			{/if}
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
		</aside>
	</jl-job-read>
</jl-job-detail>

<style>
	jl-job-detail {
		display: block;
		max-width: calc(var(--reading-width) + var(--aside-width) + var(--column-gap));
		margin-inline: auto;
	}
	jl-job-detail > button {
		min-height: var(--chip-height);
		padding: 0 var(--space-m);
		border-radius: var(--radius-round);
		font-size: var(--font-size-small);
		margin: var(--space-xs) 0 var(--space-s);
	}
	jl-job-read {
		display: block;
	}
	article {
		max-width: var(--reading-width);
	}
	/* Apply: the page's main action, kept in reach while the job is read. */
	jl-job-detail :global(details > menu) {
		position: sticky;
		top: calc(-1 * var(--space-s));
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
	aside section {
		margin-top: var(--space-l);
	}
	aside h2 {
		display: flex;
		align-items: center;
		gap: var(--space-s);
		font-size: var(--font-size);
	}
	aside h2 a {
		color: var(--color-fg);
	}
	aside p {
		margin: var(--space-xs) 0;
	}
	h2 img {
		width: var(--avatar-small);
		height: var(--avatar-small);
		border-radius: var(--radius);
		object-fit: cover;
	}

	/* Wide screens: the offer in a column to read, the rest beside it. */
	@media (min-width: 64rem) {
		jl-job-read {
			display: grid;
			grid-template-columns: minmax(0, var(--reading-width)) var(--aside-width);
			column-gap: var(--column-gap);
			align-items: start;
		}
		aside {
			position: sticky;
			top: 0;
		}
		aside section:first-child {
			margin-top: var(--space-s);
		}
	}
</style>
