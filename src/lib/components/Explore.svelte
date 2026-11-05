<script>
	import config from '#lib/data/config.json';
	import ExploreSearch from './ExploreSearch.svelte';
	import Jobs from './Jobs.svelte';
	import JobsMap from './JobsMap.svelte';
	import SavedSearches from './SavedSearches.svelte';
	import SaveSearch from './SaveSearch.svelte';
	import { replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import { fromParams, isEmpty, sameSearch, toParams } from '#lib/models/saved-search.js';
	import { markSeen, searches } from '#lib/network/saved-searches.svelte.js';
	import { data } from '#lib/network/network.svelte.js';
	import { session } from '#lib/auth/session.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * The jobs explorer: a map of the whole network, a search, and the jobs found beside it.
	 * Phones show the results as a sheet over the map (peek, half or full screen).
	 * @type {{path: string}} path: the page address the search is kept on
	 */
	let { path } = $props();

	const companies = $derived([...data.companies.values()]);
	const names = $derived(new Map(companies.map((c) => [c.key, c.name])));
	// The search lives in the page address, so any search is a link to keep or share.
	let filters = $state(fromParams(page.url.searchParams));
	let since = $state('');
	/** @type {import('#lib/ats/job.js').Job[]} */
	let jobs = $state.raw([]);
	/** @type {import('#lib/ats/job.js').Job[]} */
	let results = $state.raw([]);
	/** @type {string[]} */
	let places = $state.raw([]);
	const SHEET = /** @type {const} */ (['peek', 'half', 'full']);
	/** @type {(typeof SHEET)[number]} */
	let sheet = $state('half');
	const searching = $derived(!isEmpty(filters) || !!filters.near);

	/** @param {import('#lib/models/saved-search.js').SavedSearch} search */
	function open(search) {
		since = search.seen;
		filters = { query: search.query, where: search.where, remote: search.remote };
		markSeen(search);
	}

	// Opened from a kept link: its new jobs are marked, once.
	const arrived = searches.list.find((s) => sameSearch(s, filters));
	if (arrived) open(arrived);

	// A shallow replace changes the address, not page.url: compare with the location.
	// Not before the session is ready: a sign-in comes back to this page with its own parameters.
	$effect(() => {
		if (!session.ready) return;
		const search = toParams(filters);
		if (search !== location.search) replaceState(`${path}${search}`, {});
	});

	// What the panel hides of the map: at the left on wide screens, at the bottom on phones.
	/** @type {HTMLElement} */
	let panel;
	let covered = $state({ top: 0, right: 0, bottom: 0, left: 0 });
	$effect(() => {
		const wide = matchMedia(config.layout.wide);
		const measure = () => {
			const box = panel.getBoundingClientRect();
			const parent = /** @type {HTMLElement} */ (panel.parentElement).getBoundingClientRect();
			covered = wide.matches
				? { top: 0, right: 0, bottom: 0, left: box.right - parent.left }
				: { top: 0, right: 0, bottom: parent.bottom - box.top, left: 0 };
		};
		const observer = new ResizeObserver(measure);
		observer.observe(panel);
		wide.addEventListener('change', measure);
		return () => {
			observer.disconnect();
			wide.removeEventListener('change', measure);
		};
	});

	function nextSheet() {
		sheet = SHEET[(SHEET.indexOf(sheet) + 1) % SHEET.length];
	}
</script>

<jl-explore>
	<jl-explore-map>
		<JobsMap jobs={results} {names} here={filters.near} fit={searching} {covered} />
	</jl-explore-map>
	<jl-explore-panel {sheet} bind:this={panel}>
		<button type="button" aria-label={t('explore.sheet')} onclick={nextSheet}><span></span></button>
		<ExploreSearch bind:filters {places} />
		{#if !searching}
			<p>
				{t('explore.welcome', { jobs: jobs.length.toLocaleString(), companies: companies.length.toLocaleString() })}
				<a href="/jobs/new">{t('explore.publish')}</a>
			</p>
		{/if}
		<SavedSearches {jobs} {names} onopen={open} />
		{#if companies.length}
			<Jobs {companies} careers={false} search={false} bind:filters bind:jobs bind:results bind:places {since}>
				{#snippet actions()}<SaveSearch {filters} />{/snippet}
			</Jobs>
		{/if}
	</jl-explore-panel>
</jl-explore>

<style>
	/* The explorer takes the screen between the header and the navigation; only the panel scrolls. */
	jl-explore {
		position: fixed;
		inset: var(--header-height) 0 calc(var(--nav-height) + env(safe-area-inset-bottom)) 0;
		z-index: 1;
		background: var(--color-bg);
	}
	/* Its own layer, so the map's controls stay under the results. */
	jl-explore-map {
		position: absolute;
		inset: 0;
		z-index: 0;
	}
	jl-explore-panel {
		position: absolute;
		inset: auto 0 0 0;
		height: var(--sheet-half);
		overflow-y: auto;
		overscroll-behavior: contain;
		padding: 0 var(--gutter) var(--space-l);
		background: var(--color-bg);
		border-radius: var(--radius-large) var(--radius-large) 0 0;
		box-shadow: var(--shadow);
		transition: height var(--transition);
		z-index: 1;
	}
	jl-explore-panel[sheet='peek'] {
		height: var(--sheet-peek);
	}
	jl-explore-panel[sheet='full'] {
		height: 100%;
		border-radius: 0;
	}
	/* The handle: tap to show more or less. */
	jl-explore-panel > button {
		position: sticky;
		top: 0;
		z-index: 2;
		display: flex;
		width: calc(100% + 2 * var(--gutter));
		min-height: var(--space-l);
		margin: 0 calc(-1 * var(--gutter)) var(--space-xs);
		padding: 0;
		border: 0;
		border-radius: 0;
		background: var(--color-bg);
	}
	jl-explore-panel > button > span {
		width: var(--handle-width);
		height: var(--space-xs);
		border-radius: var(--radius-round);
		background: var(--color-line);
	}
	jl-explore-panel > p {
		margin: var(--space-s) 0 0;
		color: var(--color-muted);
		font-size: var(--font-size-small);
	}

	/* Wide screens: the results in a panel at the left, over the map. */
	@media (min-width: 64rem) {
		jl-explore {
			bottom: 0;
		}
		jl-explore-panel,
		jl-explore-panel[sheet] {
			inset: var(--space-m) auto var(--space-m) var(--space-m);
			width: var(--explore-list-width);
			height: auto;
			padding-top: var(--space-m);
			border-radius: var(--radius-large);
		}
		jl-explore-panel > button {
			display: none;
		}
	}
</style>
