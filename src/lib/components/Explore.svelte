<script>
	import config from '#lib/data/config.json';
	import ExploreSearch from './ExploreSearch.svelte';
	import Jobs from './Jobs.svelte';
	import JobDetail from './JobDetail.svelte';
	import JobItem from './JobItem.svelte';
	import JobsMap from './JobsMap.svelte';
	import SavedSearches from './SavedSearches.svelte';
	import SaveSearch from './SaveSearch.svelte';
	import { tick, untrack } from 'svelte';
	import { afterNavigate, pushState, replaceState } from '$app/navigation';
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
	// Read from the location: page.url misses the searches replaced in it (shallow routing).
	let filters = $state(fromParams(new URLSearchParams(location.search)));
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
	// A new search also closes what was open; the same search (the session getting ready) does not.
	/** @param {import('#lib/models/job.js').JobFilters} f */
	const searchKey = (f) => JSON.stringify([toParams(f), f.near, f.within]);
	let shownSearch = searchKey(untrack(() => filters));
	$effect(() => {
		if (!session.ready) return;
		const search = toParams(filters);
		const key = searchKey(filters);
		const changed = key !== shownSearch;
		shownSearch = key;
		if (search !== location.search || (changed && untrack(() => selected || picked))) replaceState(`${path}${search}`, {});
	});

	// Back, forward, or coming back from signing in: the search is the address's again.
	// Where someone is stays, it is never in the address.
	function readAddress() {
		const next = { ...fromParams(new URLSearchParams(location.search)), near: filters.near, within: filters.within };
		if (toParams(next) === toParams(filters)) return;
		shownSearch = searchKey(next);
		filters = next;
	}
	afterNavigate(readAddress);

	// What covers the map: the panel at the left on wide screens; on phones the sheet
	// at the bottom and the search floating at the top.
	/** @type {HTMLElement} */
	let panel;
	let covered = $state({ top: 0, right: 0, bottom: 0, left: 0 });
	$effect(() => {
		const wide = matchMedia(config.layout.wide);
		const measure = () => {
			const box = panel.getBoundingClientRect();
			const parent = /** @type {HTMLElement} */ (panel.parentElement).getBoundingClientRect();
			const search = panel.querySelector('jl-explore-search')?.getBoundingClientRect();
			const top = search && search.height ? search.bottom - parent.top : 0;
			covered = wide.matches
				? { top: 0, right: 0, bottom: 0, left: box.right - parent.left }
				: { top, right: 0, bottom: parent.bottom - box.top, left: 0 };
		};
		const observer = new ResizeObserver(measure);
		observer.observe(panel);
		const search = panel.querySelector('jl-explore-search');
		if (search) observer.observe(search);
		wide.addEventListener('change', measure);
		return () => {
			observer.disconnect();
			wide.removeEventListener('change', measure);
		};
	});

	// A job open in the panel, or the jobs at a place tapped on the map. They are history
	// entries (shallow routing), so the phone's back gesture closes them like pages.
	const selected = $derived(page.state.job ?? null);
	const picked = $derived(page.state.picked ?? null);
	const pickedJobs = $derived(picked ? results.filter((job) => picked?.includes(job.url)) : null);
	// Where the results were scrolled, to come back to it.
	let resultsScroll = 0;

	/** @param {import('#lib/ats/job.js').Job} job */
	function select(job) {
		if (!selected && !picked) resultsScroll = panel.scrollTop;
		pushState('', { job: $state.snapshot(job), picked: picked ?? undefined });
		if (sheet === 'peek') sheet = 'half';
		panel.scrollTop = 0;
	}

	/** @param {string[]} urls */
	function pick(urls) {
		const found = results.filter((job) => urls.includes(job.url));
		if (found.length === 1) return select(found[0]);
		if (!selected && !picked) resultsScroll = panel.scrollTop;
		pushState('', { picked: urls });
		if (sheet === 'peek') sheet = 'half';
		panel.scrollTop = 0;
	}

	/** One step back: from a job to the place it was picked from, then to the results. */
	function back() {
		history.back();
	}

	// Back on the results: where they were scrolled.
	$effect(() => {
		if (selected || picked) return;
		tick().then(() => panel && (panel.scrollTop = resultsScroll));
	});

	// Nothing found: the ways to find more, from the closest change to the widest.
	const nextMinutes = $derived(config.travel.minutes.find((m) => m > (filters.within || 0)));
	let busy = $state(false);
	const empty = $derived(searching && !busy && jobs.length > 0 && results.length === 0);

	function nextSheet() {
		sheet = SHEET[(SHEET.indexOf(sheet) + 1) % SHEET.length];
	}

	// The sheet follows a finger on its handle, then settles at the closest size; a tap steps through them.
	/** @type {{y: number, from: number, height: number, moved: boolean} | null} */
	let drag = $state(null);
	/** @param {PointerEvent} event */
	function grab(event) {
		drag = { y: event.clientY, from: panel.offsetHeight, height: panel.offsetHeight, moved: false };
		/** @type {HTMLElement} */ (event.currentTarget).setPointerCapture(event.pointerId);
	}
	/** @param {PointerEvent} event */
	function slide(event) {
		if (!drag) return;
		const room = /** @type {HTMLElement} */ (panel.parentElement).clientHeight - covered.top;
		drag.height = Math.min(room, Math.max(0, drag.from - (event.clientY - drag.y)));
		drag.moved ||= Math.abs(event.clientY - drag.y) > config.layout.dragThreshold;
	}
	function settle() {
		if (!drag) return;
		if (!drag.moved) nextSheet();
		else {
			const share = drag.height / /** @type {HTMLElement} */ (panel.parentElement).clientHeight;
			sheet = share < config.layout.sheetPeekBelow ? 'peek' : share < config.layout.sheetFullAbove ? 'half' : 'full';
		}
		drag = null;
	}
</script>

<svelte:window
	onpopstate={() => tick().then(readAddress)}
	onkeydown={(e) => e.key === 'Escape' && !(e.target instanceof HTMLInputElement) && (selected || picked) && back()}
/>

<jl-explore style:--search-room="{covered.top}px">
	<jl-explore-map>
		<JobsMap jobs={results} {names} here={filters.near} fit={searching} {covered} {selected} onpick={pick} />
	</jl-explore-map>
	<jl-explore-panel {sheet} bind:this={panel} dragging={drag ? true : undefined} style:--sheet-drag={drag ? `${drag.height}px` : undefined}>
		<button
			type="button"
			aria-label={t('explore.sheet')}
			onpointerdown={grab}
			onpointermove={slide}
			onpointerup={settle}
			onpointercancel={() => (drag = null)}
			onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), nextSheet())}
		>
			<span></span>
		</button>
		{#if selected}
			<JobDetail job={selected} jobs={results} {names} onback={back} onselect={select} />
		{:else if pickedJobs}
			<jl-explore-place>
				<button type="button" onclick={back}>← {t('explore.back')}</button>
				<h2>{t('explore.here', { count: pickedJobs.length })}</h2>
				<ul>
					{#each pickedJobs as job (job.url)}
						<li><JobItem {job} company={names.get(job.company)} onselect={() => select(job)} /></li>
					{/each}
				</ul>
			</jl-explore-place>
		{/if}
		<!-- Kept while a job is open, so its search and its place in the list are still there after. -->
		<jl-explore-results hidden={selected || pickedJobs ? true : undefined}>
			<ExploreSearch bind:filters {places} />
			{#if !searching}
				<p>
					{t('explore.welcome', { companies: companies.length.toLocaleString() })}
					<a href="/jobs/new">{t('explore.publish')}</a>
				</p>
			{/if}
			<SavedSearches {jobs} {names} onopen={open} />
			{#if companies.length}
				<Jobs
					{companies}
					careers={false}
					search={false}
					bind:filters
					bind:jobs
					bind:results
					bind:places
					bind:busy
					{since}
					onselect={select}
					selected={selected?.url}
				>
					{#snippet actions()}<SaveSearch {filters} />{/snippet}
				</Jobs>
			{/if}
			{#if empty}
				<menu aria-label={t('explore.widen')}>
					{#if filters.near && filters.within && nextMinutes}
						<li><button type="button" onclick={() => (filters.within = nextMinutes)}>{t(`near.within.${config.travel.mode}`, { minutes: nextMinutes })}</button></li>
					{:else if filters.near && filters.within}
						<li><button type="button" onclick={() => (filters.within = 0)}>{t('near.any')}</button></li>
					{/if}
					{#if filters.remote}
						<li><button type="button" onclick={() => (filters.remote = '')}>{t('explore.notOnlyRemote')}</button></li>
					{/if}
					{#if filters.where}
						<li><button type="button" onclick={() => (filters.where = '')}>{t('explore.clear', { text: filters.where })}</button></li>
					{/if}
					{#if filters.query}
						<li><button type="button" onclick={() => (filters.query = '')}>{t('explore.clear', { text: filters.query })}</button></li>
					{/if}
				</menu>
			{/if}
		</jl-explore-results>
	</jl-explore-panel>
</jl-explore>

<style>
	/* The explorer takes the whole screen above the navigation (phones) or below the header; only the panel scrolls. */
	jl-explore {
		position: fixed;
		inset: 0 0 calc(var(--nav-height) + env(safe-area-inset-bottom)) 0;
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
		height: calc(100% - var(--search-room));
	}
	jl-explore-panel[dragging] {
		height: var(--sheet-drag);
		transition: none;
	}
	/* Phones: no header on the explorer, the search floats over the top of the map. */
	@media not (min-width: 64rem) {
		jl-explore-results > :global(jl-explore-search) {
			position: fixed;
			top: calc(env(safe-area-inset-top) + var(--space-s));
			inset-inline: var(--space-s);
			z-index: 3;
			padding: var(--space-s);
			background: var(--color-bg);
			border-radius: var(--radius-large);
			box-shadow: var(--shadow);
		}
	}
	/* The handle: drag or tap to show more or less. */
	jl-explore-panel > button {
		position: sticky;
		top: 0;
		z-index: 2;
		display: flex;
		width: calc(100% + 2 * var(--gutter));
		min-height: var(--handle-height);
		touch-action: none;
		cursor: grab;
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
	jl-explore-results {
		display: block;
	}
	jl-explore-place > button {
		min-height: var(--chip-height);
		padding: 0 var(--space-m);
		border-radius: var(--radius-round);
		font-size: var(--font-size-small);
		margin: var(--space-xs) 0 0;
	}
	/* Ways to find more, as chips. */
	jl-explore-results > menu button {
		min-height: var(--chip-height);
		padding: 0 var(--space-m);
		border-radius: var(--radius-round);
		font-size: var(--font-size-small);
	}
	jl-explore-results > p {
		margin: var(--space-s) 0 0;
		color: var(--color-muted);
		font-size: var(--font-size-small);
	}

	/* Wide screens: the results in a panel at the left, over the map. */
	@media (min-width: 64rem) {
		jl-explore {
			top: var(--header-height);
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
