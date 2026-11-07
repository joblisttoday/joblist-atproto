<script>
	import Icon from './Icon.svelte';
	import config from '#lib/data/config.json';
	import JobDescription from './JobDescription.svelte';
	import { isOlder, offerPlaces, time, workplace } from '#lib/models/job.js';
	import { travelMinutes } from '#lib/models/distance.js';
	import { payAmount } from '#lib/models/salary.js';
	import { postPath } from '#lib/models/job-post.js';
	import { handleOf } from '#lib/network/network.svelte.js';
	import { markOf } from '#lib/network/job-marks.svelte.js';
	import { accountOf, thumbnail } from '#lib/network/accounts.svelte.js';
	import { ago } from '#lib/i18n/dates.js';
	import { i18n, t } from '#lib/i18n/index.svelte.js';

	/**
	 * fresh: published since the person last looked at this search.
	 * onselect: the card opens the job in the page (the explorer) instead of unfolding it.
	 * selected: the job open in the page. expanded: unfolded from the start.
	 * actions: shown when unfolded, between the summary and the description.
	 * @type {{job: import('#lib/ats/job.js').Job, company?: string, fresh?: boolean, onselect?: () => void, selected?: boolean, expanded?: boolean, actions?: import('svelte').Snippet}}
	 */
	let { job, company, fresh = false, onselect, selected = false, expanded = false, actions } = $props();
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
	const travelIcon = /** @type {import('#lib/icons.js').IconName} */ (config.travel.mode);
	// How far, when the person searches near them.
	const distance = $derived(
		job.km === undefined
			? ''
			: t(`job.distance.${config.travel.mode}`, {
					km: job.km < 10 ? job.km.toFixed(1) : Math.round(job.km),
					minutes: travelMinutes(job.km)
				})
	);
	// What it pays, when its board says.
	const pay = $derived(job.salary ? t(`job.salary.${job.salary.period}`, { amount: payAmount(job.salary, i18n.locale) }) : '');
	// Where and for whom on one line; how far, how, how much and when as chips.
	const line = $derived([location, job.department].filter(Boolean).join(' · '));
	const chips = $derived([distance, place, pay, ago(time(job.published), i18n.locale)].filter(Boolean));
	const applied = $derived(markOf(job) === 'applied');
	// First seen long ago: still listed, said so beside its date.
	const older = $derived(isOlder(job));
	// Each company keeps its color, from its key.
	// Its Bluesky picture, when the company is there; else its initial.
	const avatar = $derived(company ? accountOf(job.company)?.avatar : undefined);
	const hue = $derived([...job.company].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7));
	// Only where it starts: the reader can still fold it.
	// svelte-ignore state_referenced_locally
	let open = $state(expanded);
</script>

<jl-job posted={posted ? (posted.verified ? 'company' : 'shared') : undefined} older={older || undefined} {open} fresh={fresh || undefined} selected={selected || undefined} applied={applied || undefined}>
	{#if company}<jl-avatar style="--hue: {hue}" aria-hidden="true">{#if avatar}<img src={thumbnail(avatar)} alt="" loading="lazy" />{:else}{company.trim().charAt(0).toUpperCase()}{/if}</jl-avatar>{/if}
	{#if posted}
		<a href={postPath(posted.did, posted.rkey)}>{job.title}</a>
		<small>{#if company}<a href="/company/{job.company}">{company}</a>{line ? ' · ' : ''}{/if}{line}</small>
		<jl-chips>
			{#if applied}<mark><Icon name="applied" /> {t('marks.applied')}</mark>{/if}
			{#each chips as chip (chip)}<span>{#if chip === distance}<Icon name={travelIcon} />{' '}{/if}{chip}</span>{/each}
			{#if posted.verified}<mark><Icon name="verified" /> {t('job.verified')}</mark>{/if}
		</jl-chips>
		{#if !posted.verified}
			<small>{t('job.sharedBy')} <a href="/{handleOf(posted.did)}">@{handleOf(posted.did)}</a></small>
		{/if}
	{:else if onselect}
		<button type="button" onclick={onselect} aria-current={selected ? 'true' : undefined}>
			<strong>{job.title}</strong>
			<small>{company ? `${company}${line ? ' · ' : ''}` : ''}{line}</small>
			<jl-chips>{#if fresh}<mark data-new>{t('job.new')}</mark>{/if}{#if applied}<mark><Icon name="applied" /> {t('marks.applied')}</mark>{/if}{#each chips as chip (chip)}<span>{#if chip === distance}<Icon name={travelIcon} />{' '}{/if}{chip}</span>{/each}{#if older}<em title={t('job.older.hint', { days: config.jobs.olderDays })}>{t('job.older')}</em>{/if}</jl-chips>
		</button>
	{:else}
		<details bind:open>
			<summary>
				<strong>{job.title}</strong>
				<small>{company ? `${company}${line ? ' · ' : ''}` : ''}{line}</small>
				<jl-chips>{#if fresh}<mark data-new>{t('job.new')}</mark>{/if}{#if applied}<mark><Icon name="applied" /> {t('marks.applied')}</mark>{/if}{#each chips as chip (chip)}<span>{#if chip === distance}<Icon name={travelIcon} />{' '}{/if}{chip}</span>{/each}{#if older}<em title={t('job.older.hint', { days: config.jobs.olderDays })}>{t('job.older')}</em>{/if}</jl-chips>
			</summary>
			{#if open}{@render actions?.()}<JobDescription {job} {company} />{/if}
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
		grid-row: 1;
		display: grid;
		place-items: center;
		width: var(--avatar-small);
		height: var(--avatar-small);
		border-radius: var(--radius);
		background: hsl(var(--hue) var(--avatar-saturation) var(--avatar-lightness));
		color: var(--color-avatar-fg);
		font-weight: var(--font-weight-strong);
		overflow: hidden;
	}
	jl-avatar img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	/* A posted job lists its parts side by side with the initial. */
	jl-job[posted] jl-avatar {
		grid-row: 1 / span 4;
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
	/* A card opening the job in the page: the whole card is the button. */
	jl-job > button {
		display: block;
		width: 100%;
		min-height: 0;
		padding: 0;
		border: 0;
		background: none;
		text-align: start;
	}
	jl-job > button:hover:not(:disabled) {
		background: none;
	}
	jl-job > button:hover strong {
		text-decoration: underline;
	}
	jl-job[selected] {
		box-shadow: inset var(--selected-bar) 0 0 var(--color-focus);
		padding-inline-start: var(--space-s);
	}
	jl-job > button strong {
		display: block;
		font-weight: var(--font-weight-strong);
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
	/* New since the search was last seen: the first chip, filled. */
	jl-chips > mark[data-new] {
		background: var(--color-ok);
		color: var(--color-bg);
		font-weight: var(--font-weight-strong);
	}
	/* An offer listed for long: told, not hidden. */
	jl-chips > em {
		font-style: normal;
		color: var(--color-warn);
	}
</style>
