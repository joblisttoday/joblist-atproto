<script>
	import Icon from './Icon.svelte';
	import config from '#lib/data/config.json';
	import ExploreFields from './ExploreFields.svelte';
	import Empty from './Empty.svelte';
	import ExploreSearch from './ExploreSearch.svelte';
	import Jobs from './Jobs.svelte';
	import JobDialog from './JobDialog.svelte';
	import JobItem from './JobItem.svelte';
	import JobsMap from './JobsMap.svelte';
	import SaveSearch from './SaveSearch.svelte';
	import SearchChips from './SearchChips.svelte';
	import ViewSwitch from './ViewSwitch.svelte';
	import { readView } from '#lib/navigation/explore-view.js';
	import { tick, untrack } from 'svelte';
	import { afterNavigate, pushState, replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import { areaOf, fromParams, isEmpty, sameSearch, searchKeys, searchState, toParams } from '#lib/models/saved-search.js';
	import { addressOf, currentAddress, readAddress } from '#lib/navigation/address.js';
	import { markSeen, searches } from '#lib/network/saved-searches.svelte.js';
	import { data } from '#lib/network/network.svelte.js';
	import { session } from '#lib/auth/session.svelte.js';
	import { keptJobs } from '#lib/network/kept-jobs.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * The jobs explorer: a search and the jobs found, on a map of the whole network
	 * or as a list (a grid of cards on wide screens). Phones show the results over the
	 * map as a sheet (peek, half or full screen). A job open is read on the whole page,
	 * without the big map.
	 * @type {{path: string}} path: the page address the search is kept on
	 */
	let { path } = $props();

	// The organizations saved in this browser: their jobs, read live from their boards.
	const companies = $derived(keptJobs.companies);
	const names = $derived(new Map(companies.map((c) => [c.key, c.name])));
	// The search, the view and the job open live in the page address (after the "#", see
	// address.js), so any of them is a link to keep or share.
	const KEYS = [...searchKeys, 'view', config.jobs.jobParam];
	/** The filters an address says. @param {URLSearchParams} params */
	const filtersOf = (params) => ({ ...fromParams(params), area: areaOf(params.get('area')) });
	/**
	 * The view an address says, else the one this person last chose, else the list on a phone
	 * (the most jobs on a small screen, the map one tap away) and the map on wide screens.
	 * @param {URLSearchParams} params
	 */
	const viewOf = (params) => {
		const asked = params.get('view');
		return asked === 'list' || asked === 'grid' || asked === 'map' ? asked : readView('jobs', matchMedia(config.layout.wide).matches ? 'map' : 'list');
	};
	const arrivedAt = readAddress(KEYS);
	let filters = $state(filtersOf(arrivedAt));
	let since = $state('');
	/** @type {import('#lib/ats/job.js').Job[]} */
	let jobs = $state.raw([]);
	/** @type {import('#lib/ats/job.js').Job[]} */
	let results = $state.raw([]);
	/** @type {string[]} */
	let places = $state.raw([]);
	/** On the map, or as a list: as this person last chose. */
	let view = $state(viewOf(arrivedAt));
	const SHEET = /** @type {const} */ (['peek', 'half', 'full']);
	/** @type {(typeof SHEET)[number]} */
	let sheet = $state('half');
	const searching = $derived(!isEmpty(filters) || !!filters.near || !!filters.area);
	// The part of the map someone moved to, offered as a search.
	/** @type {import('#lib/models/job.js').Area | null} */
	let moved = $state.raw(null);
	function searchArea() {
		filters.area = moved;
		moved = null;
	}

	/** @param {import('#lib/models/saved-search.js').SavedSearch} search */
	function open(search) {
		since = search.seen;
		filters = { query: search.query, where: search.where, remote: search.remote, pay: search.pay, field: search.field || '', near: search.near ?? null, within: search.within || 0, area: null };
		markSeen(search);
	}

	// Opened from the saved page, or from a kept link: its new jobs are marked, once.
	const arrived = searches.opening || searches.list.find((s) => sameSearch(s, filters));
	searches.opening = null;
	if (arrived) open(arrived);

	// The page's state as its address keeps it, its view too: a link opens as it was shared.
	/** @param {import('#lib/models/job.js').JobFilters} f @param {string} v @param {string} [job] */
	const addressFor = (f, v, job) => addressOf({ ...searchState(f), view: v, [config.jobs.jobParam]: job }, path);

	// A shallow replace changes the address, not page.url: compare with the location.
	// Not before the session is ready: a sign-in comes back to this page with its own answer.
	// A new search also closes what was open; the same search (the session getting ready) does not.
	/** @param {import('#lib/models/job.js').JobFilters} f */
	const searchKey = (f) => JSON.stringify([toParams(f), f.near, f.within, f.area]);
	let shownSearch = searchKey(untrack(() => filters));
	$effect(() => {
		if (!session.ready) return;
		const key = searchKey(filters);
		const changed = key !== shownSearch;
		shownSearch = key;
		const open = untrack(() => selected || picked);
		if (changed && open) {
			replaceState(addressFor(filters, view), {});
			return;
		}
		const wanted = addressFor(filters, view, untrack(() => selected?.url));
		if (wanted !== currentAddress()) replaceState(wanted, untrack(() => page.state));
	});

	// Back, forward, a link to another search, coming back from signing in: the search is the
	// address's again. Where someone is stays: it is never in the address.
	function followAddress() {
		const params = readAddress(KEYS);
		const next = { ...filtersOf(params), near: filters.near, within: filters.within };
		const asked = params.get('view');
		if (asked && asked !== view) view = viewOf(params);
		if (searchKey(next) === searchKey(filters)) return;
		shownSearch = searchKey(next);
		filters = next;
	}
	afterNavigate(followAddress);
	// A link to another search on this same page only changes what follows the "#".
	$effect(() => {
		addEventListener('hashchange', followAddress);
		return () => removeEventListener('hashchange', followAddress);
	});

	// What covers the map: the panel at the left on wide screens, the sheet at the bottom on phones.
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

	// A job open in the panel, or the jobs at a place tapped on the map. They are history
	// entries (shallow routing), so the phone's back gesture closes them like pages.
	// An open job is in the address too, so it can be shared.
	const selected = $derived(page.state.job ?? null);
	// A job is read in a dialog over the jobs: the map stays as it was behind it.
	const mapShown = $derived(view === 'map');
	/** @type {import('#lib/map/jobs-map.js').Insets} */
	const uncovered = { top: 0, right: 0, bottom: 0, left: 0 };
	// Opened from a link to a job: open it once the jobs are read.
	let linked = arrivedAt.get(config.jobs.jobParam);
	$effect(() => {
		if (!linked || !session.ready) return;
		const job = jobs.find((j) => j.url === linked);
		// Not found yet: the jobs are still being read (or not started).
		if (!job && (busy || !jobs.length)) return;
		linked = null;
		if (job) replaceState(location.href, { job: $state.snapshot(job) });
	});
	const picked = $derived(page.state.picked ?? null);
	const pickedJobs = $derived(picked ? results.filter((job) => picked?.includes(job.url)) : null);
	// Where the results were scrolled, to come back to it.
	let resultsScroll = 0;

	// Before something opens: where the results were, the sheet's size, what had focus; back to them on close.
	/** @type {(typeof SHEET)[number] | null} */
	let sheetBefore = null;
	/** @type {Element | null} */
	let opener = null;
	function leaveResults() {
		if (selected || picked) return;
		resultsScroll = panel.scrollTop;
		sheetBefore = sheet;
		opener = document.activeElement;
	}

	/** @param {import('#lib/ats/job.js').Job} job */
	function select(job) {
		leaveResults();
		pushState(addressFor(filters, view, job.url), { job: $state.snapshot(job), picked: picked ?? undefined });
	}

	/** @param {string[]} urls */
	function pick(urls) {
		const found = results.filter((job) => urls.includes(job.url));
		if (found.length === 1) return select(found[0]);
		leaveResults();
		pushState(addressFor(filters, view), { picked: urls });
		if (sheet === 'peek') sheet = 'half';
		panel.scrollTop = 0;
	}

	/** One step back: from a job to the place it was picked from, then to the results. */
	function back() {
		history.back();
	}

	// Back on the results: where they were scrolled, at the size they were, focus on what opened the job.
	$effect(() => {
		if (selected || picked) return;
		untrack(() => {
			if (sheetBefore) sheet = sheetBefore;
			sheetBefore = null;
		});
		tick().then(() => {
			if (panel) panel.scrollTop = resultsScroll;
			if (opener instanceof HTMLElement && opener.isConnected) opener.focus({ preventScroll: true });
			opener = null;
		});
	});

	// Nothing found: the ways to find more, from the closest change to the widest.
	const nextMinutes = $derived(config.travel.minutes.find((m) => m > (filters.within || 0)));
	let busy = $state(false);
	// Nothing found has a place: no map to show (once the jobs are read).
	const mapless = $derived(!busy && jobs.length > 0 && !results.some((job) => job.point));
	const empty = $derived(searching && !busy && jobs.length > 0 && results.length === 0);

	function nextSheet() {
		sheet = SHEET[(SHEET.indexOf(sheet) + 1) % SHEET.length];
	}

	// The sheet follows a finger on its handle, then settles at the closest size; a tap steps through them.
	/** @type {{y: number, from: number, height: number, moved: boolean} | null} */
	let drag = $state(null);
	/** A drag ended: the click that follows it is not a tap. */
	let dragged = false;
	/** @param {PointerEvent} event */
	function grab(event) {
		dragged = false;
		drag = { y: event.clientY, from: panel.offsetHeight, height: panel.offsetHeight, moved: false };
		/** @type {HTMLElement} */ (event.currentTarget).setPointerCapture(event.pointerId);
	}
	/** @param {PointerEvent} event */
	function slide(event) {
		if (!drag) return;
		const room = /** @type {HTMLElement} */ (panel.parentElement).clientHeight;
		drag.height = Math.min(room, Math.max(0, drag.from - (event.clientY - drag.y)));
		drag.moved ||= Math.abs(event.clientY - drag.y) > config.layout.dragThreshold;
	}
	function settle() {
		if (!drag) return;
		dragged = drag.moved;
		if (drag.moved) {
			const share = drag.height / /** @type {HTMLElement} */ (panel.parentElement).clientHeight;
			sheet = share < config.layout.sheetPeekBelow ? 'peek' : share < config.layout.sheetFullAbove ? 'half' : 'full';
		}
		drag = null;
	}
	/** A tap, a key or a screen reader steps through the sizes. */
	function tap() {
		if (!dragged) nextSheet();
		dragged = false;
	}
</script>

<svelte:window
	onpopstate={() => tick().then(followAddress)}
	onkeydown={(e) => e.key === 'Escape' && !(e.target instanceof HTMLInputElement) && !selected && picked && back()}
/>

<jl-explore {view}>
	<!-- Jobs, organizations or lists; the search, and how the jobs are shown, at the same place in every view. -->
	<!-- Nothing saved yet: no search, no filters, only how to start. -->
	{#if companies.length}
	<jl-explore-bar>
		<ExploreSearch bind:filters {places}>
			{#snippet tools()}<ViewSwitch bind:view {mapless} />{/snippet}
		</ExploreSearch>
	</jl-explore-bar>
	{/if}
	<jl-explore-stage>
	<!-- undefined, not false: on a custom element, false would write inert="false", which is still inert. -->
	<jl-explore-map inert={!mapShown || undefined}>
		<JobsMap
			jobs={results}
			{names}
			here={filters.near}
			fit={searching}
			still={!!filters.area}
			covered={mapShown ? covered : uncovered}
				active={mapShown}
			{selected}
			onpick={pick}
			onmoved={(area) => (moved = area)}
		/>
	</jl-explore-map>
	{#if moved && mapShown && !picked}
		<button type="button" onclick={searchArea} style:--map-left="{covered.left}px"><Icon name="area" /> {t('explore.area')}</button>
	{/if}
	<jl-explore-panel {sheet} bind:this={panel} dragging={drag ? true : undefined} style:--sheet-drag={drag ? `${drag.height}px` : undefined}>
		<button
			type="button"
			aria-label={t(`explore.sheet.${sheet}`)}
			aria-expanded={sheet === 'full'}
			aria-controls="explore-results"
			onclick={tap}
			onpointerdown={grab}
			onpointermove={slide}
			onpointerup={settle}
			onpointercancel={() => (drag = null)}
		>
			<span></span>
		</button>
		{#if pickedJobs}
			<jl-explore-place>
				<button type="button" onclick={back}><Icon name="back" /> {t('explore.back')}</button>
				<h2>{t('explore.here', { count: pickedJobs.length })}</h2>
				<ul>
					{#each pickedJobs as job (job.url)}
						<li><JobItem {job} company={names.get(job.company)} onselect={() => select(job)} /></li>
					{/each}
				</ul>
			</jl-explore-place>
		{/if}
		<!-- Kept while a job is open, so its search and its place in the list are still there after. -->
		<jl-explore-results id="explore-results" hidden={pickedJobs ? true : undefined}>
			<!-- The fields jobs are in: one tap shows a field's jobs, searched or not. -->
			<!-- Your saved searches: one tap opens one, its new jobs marked; "All" clears the search. -->
			<SearchChips {filters} {jobs} {names} onopen={(search) => (search ? open(search) : ((since = ''), (filters = { query: '', where: '', remote: '', pay: false, field: '', near: null, within: 0, area: null })))} />
			{#if jobs.length}<ExploreFields bind:field={filters.field} {jobs} />{/if}
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
					quick
				>
					{#snippet actions()}<SaveSearch {filters} />{/snippet}
				</Jobs>
			{:else}
				<!-- joblist lists no organizations: these are the jobs of the ones saved here. -->
				<Empty text={t('explore.none')}><a href="/"><Icon name="search" /> {t('explore.none.find')}</a></Empty>
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
					{#if filters.pay}
						<li><button type="button" onclick={() => (filters.pay = false)}>{t('explore.notOnlyPay')}</button></li>
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
	</jl-explore-stage>
	{#if selected}
		<JobDialog job={selected} jobs={results} all={jobs} {names} onback={back} onselect={select} />
	{/if}
</jl-explore>

<style>
	/* The explorer takes the whole screen above the navigation (phones) or below the header:
	   the search bar at the top, the jobs under it; only the results scroll. */
	jl-explore {
		position: fixed;
		inset: 0 0 calc(var(--nav-height) + env(safe-area-inset-bottom)) 0;
		z-index: 1;
		display: flex;
		flex-direction: column;
		background: var(--color-bg);
	}
	jl-explore-bar {
		flex: none;
		display: grid;
		gap: var(--space-s);
		z-index: 2;
		padding: calc(env(safe-area-inset-top) + var(--space-s)) var(--gutter) var(--space-s);
		background: var(--color-bg);
		border-bottom: var(--border);
	}
	jl-explore-stage {
		position: relative;
		flex: 1;
		min-height: 0;
	}
	/* Its own layer, so the map's controls stay under the results. */
	jl-explore-map {
		position: absolute;
		inset: 0;
		z-index: 0;
	}
	/* Search the area moved to: a chip at the top of the free part of the map. */
	jl-explore-stage > button {
		position: absolute;
		top: var(--space-s);
		left: calc(var(--map-left) + (100% - var(--map-left)) / 2);
		translate: -50% 0;
		z-index: 1;
		min-height: var(--chip-height);
		padding: 0 var(--space-m);
		border-radius: var(--radius-round);
		font-size: var(--font-size-small);
		box-shadow: var(--shadow);
	}
	jl-explore-panel {
		position: absolute;
		inset: auto 0 0 0;
		height: var(--sheet-half);
		overflow-y: auto;
		overscroll-behavior: contain;
		/* What gets the keyboard stays below the handle stuck at its top. */
		scroll-padding-top: calc(var(--handle-height) + var(--space-xs));
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
	}
	jl-explore-panel[dragging] {
		height: var(--sheet-drag);
		transition: none;
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

	/* As a list or a grid, or reading a job: the results take the whole stage, the map stays hidden under it. */
	jl-explore:not([view='map']) jl-explore-map {
		visibility: hidden;
	}
	jl-explore:not([view='map']) jl-explore-panel,
	jl-explore:not([view='map']) jl-explore-panel[sheet] {
		inset: 0;
		width: auto;
		height: auto;
		border-radius: 0;
		box-shadow: none;
	}
	jl-explore:not([view='map']) jl-explore-panel > button {
		display: none;
	}

	/* Wide screens: the results in a panel at the left of the map; or the whole width. */
	@media (min-width: 64rem) {
		jl-explore {
			top: var(--header-height);
			bottom: 0;
		}
		jl-explore-bar {
			padding-top: var(--space-s);
		}
		jl-explore-panel,
		jl-explore-panel[sheet] {
			inset: var(--space-m) auto var(--space-m) var(--space-m);
			width: var(--explore-list-width);
			height: auto;
			padding-top: var(--space-xs);
			border-radius: var(--radius-large);
		}
		jl-explore-panel > button {
			display: none;
		}
		/* A list: one job a row, its chips at the end. */
		jl-explore[view='list'] :global(jl-jobs > ul jl-job > button) {
			display: grid;
			grid-template-columns: minmax(0, 1fr) auto;
			column-gap: var(--column-gap);
			align-items: center;
		}
		jl-explore[view='list'] :global(jl-jobs > ul jl-job > button > jl-chips) {
			grid-column: 2;
			grid-row: 1 / span 2;
			justify-content: flex-end;
			margin-top: 0;
		}
		/* A grid: cards across the width. */
		jl-explore[view='grid'] :global(jl-jobs > ul) {
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(var(--card-min), 1fr));
			column-gap: var(--column-gap);
		}
	}
</style>
