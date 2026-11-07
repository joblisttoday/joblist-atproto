<script>
	import { onDestroy } from 'svelte';
	import config from '#lib/data/config.json';
	import { mountJobsMap } from '#lib/map/jobs-map.js';
	import { whenIdle } from '#lib/navigation/after-paint.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * The jobs found, on a globe; `here` is where the person is, when they search near them;
	 * `fit` frames the jobs (after a search); `covered` is the part of the map under the page's panels;
	 * `selected` is the job open in the page; `onpick` gets the jobs at a place someone tapped;
	 * `still` leaves the map where it is; `onmoved` gets the area shown after someone moved the map.
	 * `active`: the map is shown. MapLibre loads the first time it is, and a hidden map is not
	 * given the jobs (tens of thousands of points, costly to send to it on every search).
	 * @type {{jobs: import('#lib/ats/job.js').Job[], names: Map<string, string>, here?: [number, number] | null, fit?: boolean, covered?: import('#lib/map/jobs-map.js').Insets, selected?: import('#lib/ats/job.js').Job | null, onpick?: (urls: string[]) => void, still?: boolean, onmoved?: (area: import('#lib/models/job.js').Area | null) => void, active?: boolean}}
	 */
	let { jobs, names, here = null, fit = false, covered = { top: 0, right: 0, bottom: 0, left: 0 }, selected = null, onpick, still = false, onmoved, active = true } = $props();

	/** @type {HTMLElement} */
	let figure;
	/** @type {import('#lib/map/jobs-map.js').JobsMap | undefined} */
	let map = $state();

	/** @param {import('#lib/ats/job.js').Job[]} list */
	const located = (list) =>
		list
			.filter((job) => job.point)
			.map((job) => ({
				point: /** @type {[number, number]} */ (job.point),
				title: job.title,
				url: job.url,
				company: names.get(job.company) || job.company
			}));
	// What the map was last given: shown again unchanged, it keeps where someone moved it.
	/** @type {{jobs: unknown, names: unknown, fit: boolean, still: boolean} | null} */
	let given = null;

	// MapLibre is large: loaded once the first jobs are shown and the page is idle,
	// or after a while without jobs (none found).
	let ready = $state(false);
	$effect(() => {
		if (!active || ready) return;
		if (!jobs.length) {
			const timer = setTimeout(() => (ready = true), config.map.loadWaitMs);
			return () => clearTimeout(timer);
		}
		return whenIdle(() => (ready = true), config.map.loadWaitMs);
	});

	// Made the first time the map is shown, kept after.
	$effect(() => {
		if (!active || map || !ready) return;
		map = mountJobsMap(figure, { label: (count) => t('map.jobs', { count }), onpick: onpick && ((urls) => onpick(urls)), onmoved: onmoved && ((area) => onmoved(area)) });
	});
	onDestroy(() => map?.destroy());

	$effect(() => map?.setCovered(covered));
	// Shown again after a list: framed again, at its size now.
	let shown = false;
	$effect(() => {
		const now = Boolean(active && map);
		if (now && !shown) map?.shown();
		shown = now;
	});
	$effect(() => {
		if (!active || !map) return;
		if (given && given.jobs === jobs && given.names === names && given.fit === fit && given.still === still) return;
		given = { jobs, names, fit, still };
		map.setJobs(located(jobs), fit, still);
	});
	$effect(() => map?.setHere(here));
	$effect(() => {
		if (active) map?.setSelected(selected?.point);
	});
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
