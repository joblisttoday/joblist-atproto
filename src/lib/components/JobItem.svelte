<script>
	import config from '#lib/data/config.json';
	import JobDescription from './JobDescription.svelte';
	import { offerPlaces, time, workplace } from '#lib/models/job.js';
	import { travelMinutes } from '#lib/models/distance.js';
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
	// How far, when the person searches near them.
	const distance = $derived(
		job.km === undefined
			? ''
			: t(`job.distance.${config.travel.mode}`, {
					km: job.km < 10 ? job.km.toFixed(1) : Math.round(job.km),
					minutes: travelMinutes(job.km)
				})
	);
	// Where and for whom on one line; how far, how and when as chips.
	const line = $derived([location, job.department].filter(Boolean).join(' · '));
	const chips = $derived([distance, place, ago(time(job.published), i18n.locale)].filter(Boolean));
	// Each company keeps its color, from its key.
	const hue = $derived([...job.company].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7));
	let open = $state(false);
</script>

<jl-job posted={posted ? (posted.verified ? 'company' : 'shared') : undefined} {open} fresh={fresh || undefined}>
	{#if company}<jl-avatar style="--hue: {hue}" aria-hidden="true">{company.trim().charAt(0).toUpperCase()}</jl-avatar>{/if}
	{#if posted}
		<a href={postPath(posted.did, posted.rkey)}>{job.title}</a>
		<small>{#if company}<a href="/company/{job.company}">{company}</a>{line ? ' · ' : ''}{/if}{line}</small>
		<jl-chips>
			{#each chips as chip (chip)}<span>{chip}</span>{/each}
			{#if posted.verified}<mark>✓ {t('job.verified')}</mark>{/if}
		</jl-chips>
		{#if !posted.verified}
			<small>{t('job.sharedBy')} <a href="/{handleOf(posted.did)}">@{handleOf(posted.did)}</a></small>
		{/if}
	{:else}
		<details bind:open>
			<summary>
				<strong>{#if fresh}<mark>{t('job.new')}</mark> {/if}{job.title}</strong>
				<small>{company ? `${company}${line ? ' · ' : ''}` : ''}{line}</small>
				<jl-chips>{#each chips as chip (chip)}<span>{chip}</span>{/each}</jl-chips>
			</summary>
			{#if open}<JobDescription {job} {company} />{/if}
		</details>
	{/if}
</jl-job>

<style>
	jl-job {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		column-gap: var(--space-s);
		align-items: start;
		padding: var(--space-s) 0;
		border-bottom: var(--border);
	}
	jl-job > :not(jl-avatar) {
		grid-column: 2;
	}
	jl-job:not(:has(jl-avatar)) > * {
		grid-column: 1 / -1;
	}
	/* The company's initial, in its own color. */
	jl-avatar {
		grid-row: 1 / span 4;
		display: grid;
		place-items: center;
		width: var(--avatar-small);
		height: var(--avatar-small);
		border-radius: var(--radius);
		background: hsl(var(--hue) var(--avatar-saturation) var(--avatar-lightness));
		color: var(--color-avatar-fg);
		font-weight: var(--font-weight-strong);
	}
	jl-chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-xs);
		margin-top: var(--space-xs);
	}
	jl-chips > * {
		padding: 0 var(--space-s);
		border-radius: var(--radius-round);
		background: var(--color-soft);
		color: var(--color-fg);
		font-size: var(--font-size-small);
		line-height: var(--chip-line);
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
