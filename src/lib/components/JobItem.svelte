<script>
	import FeatureLink from './FeatureLink.svelte';
	import { jobOf } from '#lib/models/featured.js';
	import { time } from '#lib/models/job.js';
	import { postPath } from '#lib/models/job-post.js';
	import { handleOf } from '#lib/network/network.svelte.js';
	import { ago } from '#lib/i18n/dates.js';
	import { i18n, t } from '#lib/i18n/index.svelte.js';

	/** @type {{job: import('#lib/ats/job.js').Job, company?: string, featuring?: boolean}} */
	let { job, company, featuring = false } = $props();
	const posted = $derived(job.posted);
	const meta = $derived(
		[job.location, job.department, job.remote && t(`job.remote.${job.remote}`), ago(time(job.published), i18n.locale)]
			.filter(Boolean)
			.join(' · ')
	);
</script>

<jl-job posted={posted ? (posted.verified ? 'company' : 'shared') : undefined}>
	{#if posted}
		<a href={postPath(posted.did, posted.rkey)}>{job.title}</a>
	{:else}
		<a href={job.url} target="_blank" rel="noopener">{job.title}</a>
	{/if}
	<small>
		{#if company}<a href="/company/{job.company}">{company}</a>{meta ? ' · ' : ''}{/if}{meta}
	</small>
	{#if posted?.verified}
		<small><mark>✓ {t('job.verified')}</mark></small>
	{:else if posted}
		<small>{t('job.sharedBy')} <a href="/{handleOf(posted.did)}">@{handleOf(posted.did)}</a></small>
	{/if}
	{#if featuring}<menu><FeatureLink job={jobOf(job)} title={job.title} /></menu>{/if}
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
	menu {
		margin: var(--space-xs) 0 0;
	}
	mark {
		background: none;
		color: var(--color-ok);
	}
</style>
