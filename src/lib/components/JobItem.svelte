<script>
	import Icon from './Icon.svelte';
	import config from '#lib/data/config.json';
	import JobAvatar from './JobAvatar.svelte';
	import JobCard from './JobCard.svelte';
	import JobDescription from './JobDescription.svelte';
	import { jobFacts } from '#lib/models/job-card.js';
	import JobMenu from './JobMenu.svelte';
	import { workplace } from '#lib/models/job.js';
	import { travelMinutes } from '#lib/models/distance.js';
	import { postPath } from '#lib/models/job-post.js';
	import { data, handleOf } from '#lib/network/network.svelte.js';
	import { getDescription } from '#lib/ats/index.js';
	import { workplaceFromText } from '#lib/models/workplace-text.js';
	import { markOf } from '#lib/network/job-marks.svelte.js';
	import { accountOf, thumbnail } from '#lib/network/accounts.svelte.js';
	import { i18n, t } from '#lib/i18n/index.svelte.js';

	/**
	 * fresh: published since the person last looked at this search.
	 * onselect: the card opens the job in the page (the explorer) instead of unfolding it.
	 * selected: the job open in the page.
	 * read: read in full (a job open in a dialog, whose header shows its title).
	 * actions: shown when unfolded, between the summary and the description.
	 * menu: its "…" (save, hide, its organization, the offer, its link); not on a preview, nor read in full (its actions are there).
	 * @type {{job: import('#lib/ats/job.js').Job, company?: string, fresh?: boolean, onselect?: () => void, selected?: boolean, read?: boolean, menu?: boolean, actions?: import('svelte').Snippet}}
	 */
	let { job, company, fresh = false, onselect, selected = false, read = false, menu = true, actions } = $props();
	const posted = $derived(job.posted);
	// Opened and its board says nothing: what its description says clearly, once it is read
	// (the same reading as the description below, not a second request).
	/** @type {import('#lib/models/workplace-text.js').Workplace | undefined} */
	let told = $state();
	$effect(() => {
		told = undefined;
		if (!read || job.posted || workplace(job)) return;
		const asked = job;
		getDescription(data.companies.get(job.company), job).then((text) => {
			if (asked === job) told = workplaceFromText(text);
		});
	});
	// What its card says (the same in the embed on other sites): models/job-card.js.
	const facts = $derived(jobFacts(job, { t, locale: i18n.locale, where: workplace(job) || told }));
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
	// Where and for whom on one line; how far, how, how much and when as chips.
	const line = $derived(facts.line);
	const chips = $derived([distance, facts.place, facts.pay, facts.age].filter(Boolean));
	const applied = $derived(markOf(job) === 'applied');
	// First seen long ago: still listed, said so beside its date.
	const older = $derived(facts.older);
	// Its Bluesky picture, when the company is there; else its initial (JobAvatar).
	const avatar = $derived(company ? accountOf(job.company)?.avatar : undefined);
	let open = $state(false);
</script>

{#snippet chipsRow()}
	<jl-chips>{#if fresh}<mark data-new>{t('job.new')}</mark>{/if}{#if applied}<mark><Icon name="applied" /> {t('marks.applied')}</mark>{/if}{#each chips as chip (chip)}<span>{#if chip === distance}<Icon name={travelIcon} />{' '}{/if}{chip}</span>{/each}{#if older}<em title={t('job.older.hint', { days: config.jobs.olderDays })}>{t('job.older')}</em>{/if}</jl-chips>
{/snippet}
{#snippet lead()}{#if fresh}<mark data-new>{t('job.new')}</mark>{/if}{#if applied}<mark><Icon name="applied" /> {t('marks.applied')}</mark>{/if}{#if distance}<span><Icon name={travelIcon} /> {distance}</span>{/if}{/snippet}

<jl-job menu={(menu && !read) || undefined} posted={posted ? (posted.verified ? 'company' : 'shared') : undefined} older={older || undefined} read={read || undefined} {open} fresh={fresh || undefined} selected={selected || undefined} applied={applied || undefined}>
	{#if company}<JobAvatar key={job.company} name={company} src={avatar ? thumbnail(avatar) : ''} />{/if}
	{#if posted}
		{#if !read}<a href={postPath(posted.did, posted.rkey)}>{job.title}</a>{/if}
		<small>{#if company}<a href="/company/{job.company}">{company}</a>{line ? ' · ' : ''}{/if}{line}</small>
		<jl-chips>
			{#if applied}<mark><Icon name="applied" /> {t('marks.applied')}</mark>{/if}
			{#each chips as chip (chip)}<span>{#if chip === distance}<Icon name={travelIcon} />{' '}{/if}{chip}</span>{/each}
			{#if posted.verified}<mark><Icon name="verified" /> {t('job.verified')}</mark>{/if}
		</jl-chips>
		{#if !posted.verified}
			<small>{t('job.sharedBy')} <a href="/{handleOf(posted.did)}">@{handleOf(posted.did)}</a></small>
		{/if}
		{#if read}<jl-job-body>{@render actions?.()}</jl-job-body>{/if}
	{:else if read}
		{#if line}<small>{line}</small>{/if}
		{@render chipsRow()}
		<!-- The offer itself takes the whole width, under the company's picture too. -->
		<jl-job-body>{@render actions?.()}<JobDescription {job} {company} /></jl-job-body>
	{:else if onselect}
		<button type="button" onclick={onselect} aria-current={selected ? 'true' : undefined}>
			<JobCard title={job.title} {company} {facts} {lead} />
		</button>
	{:else}
		<details bind:open>
			<summary>
				<JobCard title={job.title} {company} {facts} {lead} />
			</summary>
			{#if open}{@render actions?.()}<JobDescription {job} {company} />{/if}
		</details>
	{/if}
	{#if menu && !read}<jl-job-menu><JobMenu {job} {company} /></jl-job-menu>{/if}
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
	jl-job > :not(:global(jl-avatar)) {
		grid-column: 2;
	}
	jl-job:not(:has(> :global(jl-avatar))) > *,
	jl-job > jl-job-body {
		grid-column: 1 / -1;
	}
	/* The "…" at the top of the card's end, over it. */
	jl-job[menu] {
		position: relative;
		padding-inline-end: var(--tap-size);
	}
	jl-job-menu {
		position: absolute;
		top: var(--space-xxs);
		inset-inline-end: calc(-1 * var(--space-s));
		z-index: 1;
	}
	/* Read in full: the title is in the dialog's header. */
	jl-job[read] {
		border-bottom: 0;
	}
	jl-job-body {
		display: block;
	}
	/* The company's picture or initial (JobAvatar), in the first column. */
	jl-job > :global(jl-avatar) {
		grid-row: 1;
	}
	/* A posted job lists its parts side by side with the initial. */
	jl-job[posted] > :global(jl-avatar) {
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
	jl-job > button:hover :global(strong) {
		text-decoration: underline;
	}
	jl-job[selected] {
		box-shadow: inset var(--selected-bar) 0 0 var(--color-focus);
		padding-inline-start: var(--space-s);
	}
	jl-job > a {
		min-height: var(--chip-height);
		align-content: center;
	}
	jl-job > a {
		display: block;
		font-weight: var(--font-weight-strong);
		text-decoration: none;
	}
	jl-job > a:hover,
	summary:hover :global(strong) {
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
	:global(jl-chips) > mark[data-new] {
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
