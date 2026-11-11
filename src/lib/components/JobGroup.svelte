<script>
	import JobItem from './JobItem.svelte';
	import { formatNumber, t } from '#lib/i18n/index.svelte.js';

	/**
	 * A group of jobs: an organization's (key: a link to its page), or a team's on an organization's page.
	 * @type {{key?: string, name: string, jobs: import('#lib/ats/job.js').Job[]}}
	 */
	let { key, name, jobs } = $props();
	// Jobs are rendered only once opened: a group can hold hundreds.
	let open = $state(false);
</script>

<jl-job-group>
	<details bind:open>
		<summary>{name} <small>{formatNumber(jobs.length)}</small></summary>
		{#if open}
			<ul>{#each jobs as job (job.url)}<li><JobItem {job} /></li>{/each}</ul>
			{#if key}<p><a href="/company/{key}">{t('jobs.aboutCompany', { name })}</a></p>{/if}
		{/if}
	</details>
</jl-job-group>

<style>
	details {
		border-bottom: var(--border);
	}
	summary small {
		font-weight: normal;
	}
	ul {
		margin-left: var(--space-m);
	}
	p {
		margin: var(--space-s) 0 var(--space-s) var(--space-m);
	}
</style>
