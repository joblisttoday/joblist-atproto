<script>
	import { jobPath } from '#lib/records.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * A job offer in a list: its title (its page), then where and how.
	 * @type {{job: import('#lib/profile.js').Job, did: string}}
	 */
	let { job, did } = $props();
	const facts = $derived([job.place, job.remote && t(`job.remote.${job.remote}`), job.employment && t(`job.employment.${job.employment}`)].filter(Boolean));
</script>

<li>
	<a href={jobPath(did, job.rkey)}>{job.title}</a>
	{#if facts.length}<small>{facts.join(' · ')}</small>{/if}
</li>

<style>
	li {
		display: grid;
		gap: var(--space-xs);
		padding: var(--space-s) 0;
		border-bottom: var(--border);
	}
	a {
		display: block;
		min-height: var(--tap-size);
		align-content: center;
		font-weight: var(--font-weight-strong);
		text-decoration: none;
	}
	a:hover {
		text-decoration: underline;
	}
</style>
