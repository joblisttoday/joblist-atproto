<script>
	import JobDialog from './JobDialog.svelte';
	import { closeJob, followJobLink, openJob, showJob } from '#lib/navigation/job-open.svelte.js';

	/**
	 * The job tapped in a page's list, read in a dialog over it (job-open.svelte.js);
	 * a link to one of the page's jobs (#job=…) opens it once they are read.
	 * jobs: those shown (its neighbours are among them); all: every one read; done: all are read.
	 * @type {{jobs: import('#lib/ats/job.js').Job[], all?: import('#lib/ats/job.js').Job[], names: Map<string, string>, done?: boolean}}
	 */
	let { jobs, all = jobs, names, done = true } = $props();
	followJobLink(() => ({ jobs: all, done }));
	const job = $derived(openJob());
</script>

{#if job}
	<JobDialog {job} {jobs} {all} {names} onback={closeJob} onselect={showJob} />
{/if}
