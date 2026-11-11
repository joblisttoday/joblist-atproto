<script>
	import config from '#lib/data/config.json';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * What a job's card says, the same on joblist (JobItem) and in the embed on other sites:
	 * its title, its organization, where and for which team, then as chips how, how much and
	 * when it was published (models/job-card.js), and that it has been listed for long.
	 * lead: chips before them (the site's: new, applied, how far).
	 * @type {{title: string, company?: string, facts: import('#lib/models/job-card.js').Facts, lead?: import('svelte').Snippet}}
	 */
	let { title, company = '', facts, lead } = $props();
	const chips = $derived([facts.place, facts.pay, facts.age].filter(Boolean));
</script>

<strong>{title}</strong>
<small>{company ? `${company}${facts.line ? ' · ' : ''}` : ''}{facts.line}</small>
<jl-chips>
	{@render lead?.()}{#each chips as chip (chip)}<span>{chip}</span>{/each}{#if facts.older}<em title={t('job.older.hint', { days: config.jobs.olderDays })}>{t('job.older')}</em>{/if}
</jl-chips>

<style>
	strong {
		display: block;
		font-weight: var(--font-weight-strong);
	}
	small {
		display: block;
		color: var(--color-muted);
		font-size: var(--font-size-small);
	}
	jl-chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-xs);
		margin-top: var(--space-xs);
	}
	jl-chips > :global(*) {
		padding: 0 var(--space-s);
		border-radius: var(--radius-round);
		background: var(--color-soft);
		color: var(--color-fg);
		font-size: var(--font-size-small);
		line-height: var(--chip-line);
	}
	/* An offer listed for long: told, not hidden. */
	jl-chips > em {
		font-style: normal;
		color: var(--color-warn);
	}
</style>
