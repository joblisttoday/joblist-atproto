<script>
	import config from '#lib/data/config.json';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * What a job's row says, the same on joblist (JobItem) and in the embed on other sites, as
	 * every row (docs/architecture.md: rows and chips): its title, then one muted line in the
	 * usual order (organization · place and team · workplace · pay · when), its state first as
	 * a chip (lead: the site's: new, applied; or listed for long).
	 * @type {{title: string, company?: string, facts: import('#lib/models/job-card.js').Facts, lead?: import('svelte').Snippet}}
	 */
	let { title, company = '', facts, lead } = $props();
	const meta = $derived([company, facts.line, facts.place, facts.pay, facts.age].filter(Boolean).join(' · '));
</script>

<strong>{title}</strong>
<small
	>{@render lead?.()}{#if facts.older}<jl-chip tone="warn" title={t('job.older.hint', { days: config.jobs.olderDays })}>{t('job.older')}</jl-chip>{/if}<span>{meta}</span></small
>

<style>
	strong {
		display: block;
		font-weight: var(--font-weight-strong);
	}
	small {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0 var(--space-xs);
		color: var(--color-muted);
		font-size: var(--font-size-small);
	}
	/* Its own copy of the chip (the embed lives in a shadow root, apart from the site's styles). */
	small > :global(jl-chip) {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xxs);
		padding: 0 var(--space-s);
		border-radius: var(--radius-round);
		background: var(--color-soft);
		color: var(--color-fg);
		font-weight: var(--font-weight-strong);
		line-height: var(--chip-line);
		white-space: nowrap;
	}
	small > :global(jl-chip[tone='ok']) {
		color: var(--color-ok);
	}
	small > :global(jl-chip[tone='warn']) {
		color: var(--color-warn);
	}
	small > :global(jl-chip[tone='new']) {
		background: var(--color-ok);
		color: var(--color-bg);
	}
</style>
