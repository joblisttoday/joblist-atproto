<script>
	import { time } from '#lib/models/job.js';
	import { ago } from '#lib/i18n/dates.js';
	import { i18n } from '#lib/i18n/index.svelte.js';

	/** @type {{job: import('#lib/ats/job.js').Job, company?: string}} */
	let { job, company } = $props();
	const meta = $derived(
		[job.location, job.department, ago(time(job.published), i18n.locale)].filter(Boolean).join(' · ')
	);
</script>

<jl-job>
	<a href={job.url} target="_blank" rel="noopener">{job.title}</a>
	<small>
		{#if company}<a href="/company/{job.company}">{company}</a>{meta ? ' · ' : ''}{/if}{meta}
	</small>
</jl-job>

<style>
	jl-job {
		display: block;
		padding: var(--space-s) 0;
		border-bottom: var(--border);
	}
	jl-job > a {
		display: block;
		font-weight: var(--font-weight-strong);
		text-decoration: none;
	}
	jl-job > a:hover {
		text-decoration: underline;
	}
	jl-job > a:visited {
		color: var(--color-muted);
	}
	small {
		display: block;
	}
	small a {
		color: var(--color-fg);
	}
</style>
