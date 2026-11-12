<script>
	import FilterChips from './FilterChips.svelte';
	import { teamsOf } from '#lib/models/team.js';
	import { offerCount, placeCounts } from '#lib/models/job.js';
	import { t } from '#lib/i18n/index.svelte.js';
	import Jobs from './Jobs.svelte';
	import { untrack } from 'svelte';
	import config from '#lib/data/config.json';
	import { page } from '$app/state';
	import { replaceState } from '$app/navigation';
	import { openJob } from '#lib/navigation/job-open.svelte.js';
	import { keepAddress, readAddress } from '#lib/navigation/address.js';
	import { fromParams, searchState } from '#lib/models/saved-search.js';
	import { session } from '#lib/auth/session.svelte.js';

	/**
	 * An organization's jobs, one list: a box to filter them when there are many, its teams as
	 * chips (#team=…), its places as chips (#where=…: as its jobs name them, each spelling of a
	 * place together, job.js placeCounts). Near me, remote, pay and the map are on Jobs, across the saved
	 * organizations. A job opens in a dialog over them: a history entry (back closes it), in
	 * the address to share.
	 * jobs: every job read, for the page. local: an organization only this browser knows
	 * (CompanyPage): its board is read live, never the snapshot's jobs, and its address keeps
	 * the link it is found by (#url=…).
	 * @type {{company: import('#lib/models/company.js').Company, jobs?: import('#lib/ats/job.js').Job[], address?: Record<string, string>, local?: boolean}}
	 */
	let { company, jobs = $bindable([]), address = {}, local = false } = $props();

	// Its search, its view and the job open are in the address (after the "#").
	const params = readAddress(['q', 'where', 'team', config.jobs.jobParam]);
	/** @type {import('#lib/models/job.js').JobFilters} */
	let filters = $state({ ...fromParams(params), remote: '', pay: false, team: params.get('team') || '', near: null, within: 0 });
	/** @param {string} [job] */
	const stateOf = (job) => ({ ...address, ...searchState(filters), team: filters.team, [config.jobs.jobParam]: job });
	/** @type {import('#lib/ats/job.js').Job[]} */
	let results = $state.raw([]);
	/** @type {string[]} */
	let places = $state.raw([]);
	let busy = $state(false);
	// A few jobs are read at a glance: a box to filter them comes with many (or a search in the address).
	const searchable = $derived(jobs.length > config.jobs.companySearchFrom || Boolean(filters.query));

	// Its teams, the largest first: chips when there are two or more.
	const teams = $derived(teamsOf(jobs, offerCount));
	// Its places, the most named first: chips when there are two or more.
	const placeChips = $derived(placeCounts(jobs, config.jobs.companyPlaces).map(([place, count]) => ({ id: place, label: place, count })));

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

<jl-company-jobs>
	{#if searchable}
		<input type="search" bind:value={filters.query} placeholder={t('company.filter')} aria-label={t('company.filter')} />
	{/if}
	{#if teams.length > 1}<FilterChips label={t('jobs.teams')} items={teams} bind:value={filters.team} />{/if}
	{#if placeChips.length > 1}<FilterChips label={t('jobs.places')} items={placeChips} bind:value={filters.where} />{/if}
	<Jobs companies={[company]} search={false} {filters} bind:jobs bind:results bind:places bind:busy />
</jl-company-jobs>

<style>
	jl-company-jobs {
		display: block;
	}
	input {
		width: 100%;
		margin-bottom: var(--space-s);
	}
</style>
