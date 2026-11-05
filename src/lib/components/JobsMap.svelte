<script>
	import { onMount } from 'svelte';
	import { mountJobsMap } from '#lib/map/jobs-map.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * The jobs found, on a globe; `here` is where the person is, when they search near them;
	 * `fit` frames the jobs (after a search); `covered` is the part of the map under the page's panels.
	 * @type {{jobs: import('#lib/ats/job.js').Job[], names: Map<string, string>, here?: [number, number] | null, fit?: boolean, covered?: import('#lib/map/jobs-map.js').Insets}}
	 */
	let { jobs, names, here = null, fit = false, covered = { top: 0, right: 0, bottom: 0, left: 0 } } = $props();

	/** @type {HTMLElement} */
	let figure;
	/** @type {import('#lib/map/jobs-map.js').JobsMap | undefined} */
	let map = $state();

	const located = $derived(
		jobs
			.filter((job) => job.point)
			.map((job) => ({
				point: /** @type {[number, number]} */ (job.point),
				title: job.title,
				url: job.url,
				company: names.get(job.company) || job.company
			}))
	);

	onMount(() => {
		map = mountJobsMap(figure, { label: (count) => t('map.jobs', { count }) });
		return () => map?.destroy();
	});

	$effect(() => map?.setCovered(covered));
	$effect(() => map?.setJobs(located, fit));
	$effect(() => map?.setHere(here));
</script>

<jl-jobs-map>
	<figure bind:this={figure}></figure>
</jl-jobs-map>

<style>
	jl-jobs-map {
		display: block;
		height: 100%;
	}
	figure {
		height: 100%;
		margin: 0;
	}
	/* MapLibre builds its popups outside Svelte. */
	jl-jobs-map :global(.maplibregl-popup-content) {
		background: var(--color-bg);
		color: var(--color-fg);
		padding: var(--space-s) var(--space-m);
		border-radius: var(--radius);
	}
	jl-jobs-map :global(.maplibregl-popup-content li) {
		padding: var(--space-xs) 0;
		font-size: var(--font-size-small);
		color: var(--color-muted);
	}
	jl-jobs-map :global(.maplibregl-popup-content a) {
		font-weight: var(--font-weight-strong);
		color: var(--color-fg);
	}
	jl-jobs-map :global(.maplibregl-popup-tip) {
		display: none;
	}
</style>
