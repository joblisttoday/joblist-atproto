<script>
	import ExploreSearch from './ExploreSearch.svelte';
	import FollowFeed from './FollowFeed.svelte';
	import JobDialog from './JobDialog.svelte';
	import Jobs from './Jobs.svelte';
	import JobsMap from './JobsMap.svelte';
	import ViewSwitch from './ViewSwitch.svelte';
	import { untrack } from 'svelte';
	import config from '#lib/data/config.json';
	import { page } from '$app/state';
	import { pushState, replaceState } from '$app/navigation';
	import { readView, viewParam } from '#lib/navigation/explore-view.js';
	import { addressOf, keepAddress, readAddress } from '#lib/navigation/address.js';
	import { fromParams, searchState } from '#lib/models/saved-search.js';
	import { session } from '#lib/auth/session.svelte.js';
	import { isCompanyKey } from '#lib/models/landing.js';

	/**
	 * A company's jobs, searched like the explorer's (what, where, near, remote, pay),
	 * as a list, a grid of cards (wide screens) or on a map. A job opens in a dialog
	 * over them: a history entry (back closes it), in the address to share.
	 * @type {{company: import('#lib/models/company.js').Company}}
	 */
	let { company } = $props();

	// Its search, its view and the job open are in the address (after the "#").
	const params = readAddress(['q', 'where', 'remote', 'pay', 'view', config.jobs.jobParam]);
	/** @type {import('#lib/models/job.js').JobFilters} */
	let filters = $state({ ...fromParams(params), near: null, within: 0 });
	let view = $state(viewParam(params.get('view')) || readView('company', 'list'));
	/** @param {string} [job] */
	const stateOf = (job) => ({ ...searchState(filters), area: '', view: view === 'list' ? '' : view, [config.jobs.jobParam]: job });
	/** @type {import('#lib/ats/job.js').Job[]} */
	let jobs = $state.raw([]);
	/** @type {import('#lib/ats/job.js').Job[]} */
	let results = $state.raw([]);
	/** @type {string[]} */
	let places = $state.raw([]);
	let busy = $state(false);
	const names = $derived(new Map([[company.key, company.name]]));
	// A few jobs are read at a glance: searching them comes with many (or a search in the address).
	const searchable = $derived(jobs.length > config.jobs.companySearchFrom || Boolean(filters.query || filters.where || filters.remote || filters.pay));
	const map = $derived(view === 'map');
	// Nothing found has a place: no map to show (once the jobs are read).
	const mapless = $derived(!busy && jobs.length > 0 && !results.some((job) => job.point));

	const selected = $derived(page.state.job ?? null);

	/** @param {import('#lib/ats/job.js').Job} job */
	function select(job) {
		pushState(addressOf(stateOf(job.url)), { job: $state.snapshot(job) });
	}

	function back() {
		history.back();
	}

	// Opened from a link to one of its jobs: open it once the jobs are read.
	let linked = params.get(config.jobs.jobParam);
	$effect(() => {
		if (!linked || !session.ready) return;
		const job = jobs.find((j) => j.url === linked);
		if (!job && (busy || !jobs.length)) return;
		linked = null;
		if (job) replaceState(location.href, { job: $state.snapshot(job) });
	});

	// The search and the view stay in the address, with the job open (once the session is ready:
	// a sign-in comes back with its own answer).
	$effect(() => {
		if (!session.ready) return;
		const open = untrack(() => selected?.url);
		keepAddress(stateOf(open), (url) => replaceState(url, untrack(() => page.state)));
	});
</script>

<jl-company-jobs {view}>
	{#if searchable}
		<jl-company-jobs-bar>
			<ExploreSearch bind:filters {places}>
				{#snippet tools()}<ViewSwitch bind:view page="company" {mapless} />{/snippet}
			</ExploreSearch>
		</jl-company-jobs-bar>
	{/if}
	{#if map}
		<jl-company-jobs-map><JobsMap jobs={results} {names} fit /></jl-company-jobs-map>
	{/if}
	<jl-company-jobs-list hidden={map || undefined}>
		<Jobs
			companies={[company]}
			search={false}
			{filters}
			bind:jobs
			bind:results
			bind:places
			bind:busy
			onselect={select}
			selected={selected?.url}
		>
			{#snippet actions()}
				{#if isCompanyKey(company.key)}<FollowFeed feed={{ company: company.key }} />{/if}
			{/snippet}
		</Jobs>
	</jl-company-jobs-list>
	{#if selected}
		<JobDialog job={selected} jobs={results} all={jobs} {names} onback={back} onselect={select} />
	{/if}
</jl-company-jobs>

<style>
	jl-company-jobs {
		display: block;
	}
	/* The search stays in reach under the header while scrolling the jobs. */
	jl-company-jobs-bar {
		display: block;
		position: sticky;
		top: var(--header-height);
		z-index: 5;
		margin: 0 calc(-1 * var(--gutter));
		padding: var(--space-s) var(--gutter);
		background: var(--color-bg);
		border-bottom: var(--border);
	}
	jl-company-jobs-map {
		display: block;
		height: var(--map-height);
		margin: var(--space-s) calc(-1 * var(--gutter)) 0;
	}
	jl-company-jobs-list {
		display: block;
	}
	/* Wide screens: as a grid, cards across the width. */
	@media (min-width: 64rem) {
		jl-company-jobs-bar {
			margin-inline: 0;
			padding-inline: 0;
		}
		jl-company-jobs-map {
			margin-inline: 0;
			border-radius: var(--radius-large);
			overflow: hidden;
		}
		jl-company-jobs[view='grid'] :global(jl-jobs > ul) {
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(var(--card-min), 1fr));
			column-gap: var(--column-gap);
		}
	}
</style>
