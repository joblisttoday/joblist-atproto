<script>
	import ExploreSearch from './ExploreSearch.svelte';
	import FilterChips from './FilterChips.svelte';
	import { teamsOf } from '#lib/models/team.js';
	import { offerCount } from '#lib/models/job.js';
	import { t } from '#lib/i18n/index.svelte.js';
	import Jobs from './Jobs.svelte';
	import JobsMap from './JobsMap.svelte';
	import ViewSwitch from './ViewSwitch.svelte';
	import { untrack } from 'svelte';
	import config from '#lib/data/config.json';
	import { page } from '$app/state';
	import { replaceState } from '$app/navigation';
	import { openJob } from '#lib/navigation/job-open.svelte.js';
	import { readView, viewParam } from '#lib/navigation/explore-view.js';
	import { keepAddress, readAddress } from '#lib/navigation/address.js';
	import { fromParams, searchState } from '#lib/models/saved-search.js';
	import { session } from '#lib/auth/session.svelte.js';

	/**
	 * A company's jobs, searched like the explorer's (what, where, near, remote, pay),
	 * as a list, a grid of cards (wide screens) or on a map; its teams as chips to filter by (#team=…). A job opens in a dialog
	 * over them: a history entry (back closes it), in the address to share.
	 * jobs: every job read, for the page. local: an organization only this browser knows
	 * (CompanyPage): its board is read live, never the snapshot's jobs, and its address keeps
	 * the link it is found by (#url=…).
	 * @type {{company: import('#lib/models/company.js').Company, jobs?: import('#lib/ats/job.js').Job[], address?: Record<string, string>, local?: boolean}}
	 */
	let { company, jobs = $bindable([]), address = {}, local = false } = $props();
	const noSnapshot = () => Promise.resolve(null);

	// Its search, its view and the job open are in the address (after the "#").
	const params = readAddress(['q', 'where', 'remote', 'pay', 'team', 'view', config.jobs.jobParam]);
	/** @type {import('#lib/models/job.js').JobFilters} */
	let filters = $state({ ...fromParams(params), team: params.get('team') || '', near: null, within: 0 });
	/** @type {import('#lib/navigation/explore-view.js').ExploreView[]} */
	const views = ['list', 'grid', 'map'];
	let view = $state(viewParam(params.get('view'), views) || readView('company', 'list', views));
	/** @param {string} [job] */
	const stateOf = (job) => ({ ...address, ...searchState(filters), team: filters.team, area: '', view: view === 'list' ? '' : view, [config.jobs.jobParam]: job });
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

	// Its teams, the largest first: chips when there are two or more.
	const teams = $derived(teamsOf(jobs, offerCount).map(({ id, count }) => ({ id, count, label: id.startsWith('field:') ? t(`field.${id.slice(6)}`) : id })));

	// A job opens in a dialog over them (Jobs, job-open.svelte.js).
	const selected = $derived(openJob());

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
				{#snippet tools()}<ViewSwitch bind:view page="company" {views} {mapless} />{/snippet}
			</ExploreSearch>
		</jl-company-jobs-bar>
	{/if}
	{#if map}
		<jl-company-jobs-map><JobsMap jobs={results} {names} fit /></jl-company-jobs-map>
	{/if}
	{#if teams.length > 1}<FilterChips label={t('jobs.teams')} items={teams} bind:value={filters.team} />{/if}
	<jl-company-jobs-list hidden={map || undefined}>
		<Jobs
			companies={[company]}
			search={false}
			source={local ? noSnapshot : undefined}
			{filters}
			bind:jobs
			bind:results
			bind:places
			bind:busy
		>
		</Jobs>
	</jl-company-jobs-list>
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
