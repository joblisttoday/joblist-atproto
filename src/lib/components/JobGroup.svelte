<script>
	import JobItem from './JobItem.svelte';
	import { t } from '#lib/i18n/index.svelte.js';

	/** @type {{key: string, name: string, jobs: import('#lib/ats/job.js').Job[]}} */
	let { key, name, jobs } = $props();
	// Jobs are rendered only once opened: a group can hold hundreds.
	let open = $state(false);
</script>

<jl-job-group>
	<details bind:open>
		<summary>{name} <small>{jobs.length}</small></summary>
		{#if open}
			<ul>{#each jobs as job (job.url)}<li><JobItem {job} /></li>{/each}</ul>
			<p><a href="/company/{key}">{t('jobs.aboutCompany', { name })}</a></p>
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
