<script>
	import JobDetail from './JobDetail.svelte';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * A job read in a native dialog over the jobs (the map, the list or the grid stay
	 * as they were behind it): almost the whole screen on wide screens, all of it on
	 * phones. Escape, a tap beside it and the back gesture close it (onback: one step
	 * back in history, where it was opened).
	 * @type {{
	 *   job: import('#lib/ats/job.js').Job,
	 *   jobs: import('#lib/ats/job.js').Job[],
	 *   all: import('#lib/ats/job.js').Job[],
	 *   names: Map<string, string>,
	 *   onback: () => void,
	 *   onselect: (job: import('#lib/ats/job.js').Job) => void
	 * }}
	 */
	let { job, jobs, all, names, onback, onselect } = $props();
	/** @type {HTMLDialogElement | undefined} */
	let dialog = $state();

	/** @param {HTMLDialogElement} node */
	function open(node) {
		node.showModal();
		return () => node.open && node.close();
	}

	// Another job opened from this one: read from its top.
	$effect(() => {
		job.url;
		if (dialog) dialog.scrollTop = 0;
	});
</script>

<dialog
	bind:this={dialog}
	{@attach open}
	aria-label={job.title}
	oncancel={(e) => (e.preventDefault(), onback())}
	onclick={(e) => e.target === dialog && onback()}
>
	<JobDetail {job} {jobs} {all} {names} {onback} {onselect} />
</dialog>

<style>
	dialog {
		width: min(var(--dialog-width), 100% - 2 * var(--space-l));
		max-width: none;
		height: calc(100dvh - 2 * var(--space-l));
		max-height: none;
		padding: 0 var(--gutter) var(--space-l);
		border: 0;
		border-radius: var(--radius-large);
		background: var(--color-bg);
		color: var(--color-fg);
		box-shadow: var(--shadow);
		overflow-y: auto;
		overscroll-behavior: contain;
	}
	dialog::backdrop {
		background: var(--backdrop);
	}
	/* Phones: the whole screen. */
	@media not (min-width: 48rem) {
		dialog {
			width: 100%;
			height: 100%;
			margin: 0;
			border-radius: 0;
			box-shadow: none;
		}
	}
</style>
