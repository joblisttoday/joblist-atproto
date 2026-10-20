<script>
	import config from '#lib/data/config.json';
	import JobDescription from './JobDescription.svelte';
	import { offerPlaces, time, workplace } from '#lib/models/job.js';
	import { postPath } from '#lib/models/job-post.js';
	import { handleOf } from '#lib/network/network.svelte.js';
	import { ago } from '#lib/i18n/dates.js';
	import { i18n, t } from '#lib/i18n/index.svelte.js';

	/**
	 * fresh: published since the person last looked at this search.
	 * @type {{job: import('#lib/ats/job.js').Job, company?: string, fresh?: boolean}}
	 */
	let { job, company, fresh = false } = $props();
	const MAX_PLACES = config.jobs.placesShown;
	const posted = $derived(job.posted);
	const where = $derived(workplace(job));
	// The work place, unless the location already says it ("Remote - USA").
	const place = $derived(where && !(job.location || '').toLowerCase().includes(t(`job.remote.${where}`).toLowerCase()) ? t(`job.remote.${where}`) : '');
	// The same offer at several places: the first ones, then how many more.
	const places = $derived(offerPlaces(job));
	const location = $derived(
		places.length > MAX_PLACES ? `${places.slice(0, MAX_PLACES).join('; ')} ${t('job.places.more', { count: places.length - MAX_PLACES })}` : places.join('; ')
	);
	const meta = $derived([location, place, job.department, ago(time(job.published), i18n.locale)].filter(Boolean).join(' · '));
	let open = $state(false);
</script>

<jl-job posted={posted ? (posted.verified ? 'company' : 'shared') : undefined} {open} fresh={fresh || undefined}>
	{#if posted}
		<a href={postPath(posted.did, posted.rkey)}>{job.title}</a>
		<small>
			{#if company}<a href="/company/{job.company}">{company}</a>{meta ? ' · ' : ''}{/if}{meta}
		</small>
		{#if posted.verified}
			<small><mark>✓ {t('job.verified')}</mark></small>
		{:else}
			<small>{t('job.sharedBy')} <a href="/{handleOf(posted.did)}">@{handleOf(posted.did)}</a></small>
		{/if}
	{:else}
		<details bind:open>
			<summary>
				<strong>{#if fresh}<mark>{t('job.new')}</mark> {/if}{job.title}</strong>
				<small>{company ? `${company}${meta ? ' · ' : ''}` : ''}{meta}</small>
			</summary>
			{#if open}<JobDescription {job} {company} />{/if}
		</details>
	{/if}
</jl-job>

<style>
	jl-job {
		display: block;
		padding: var(--space-s) 0;
		border-bottom: var(--border);
	}
	jl-job > a,
	summary strong {
		display: block;
		font-weight: var(--font-weight-strong);
		text-decoration: none;
	}
	jl-job > a:hover,
	summary:hover strong {
		text-decoration: underline;
	}
	summary {
		cursor: pointer;
		list-style: none;
	}
	summary::-webkit-details-marker {
		display: none;
	}
	small {
		display: block;
	}
	small a {
		color: var(--color-fg);
	}
	mark {
		background: none;
		color: var(--color-ok);
	}
</style>
