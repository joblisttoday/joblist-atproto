<script>
	import config from '#lib/data/config.json';
	import JobFilters from './JobFilters.svelte';
	import JobGroup from './JobGroup.svelte';
	import JobItem from './JobItem.svelte';
	import { getJobs } from '#lib/ats/index.js';
	import { mapLimit } from '#lib/atproto/xrpc.js';
	import { getSnapshotFirst, getSnapshotJobs } from '#lib/network/snapshot.js';
	import { boardUrl, hasJobsApi } from '#lib/models/company.js';
	import { byCompany, commonPlaces, filterJobs, offerCount, sameOffers, time } from '#lib/models/job.js';
	import { mergeJobs, postedFirst, withPoints } from '#lib/models/job-post.js';
	import { data } from '#lib/network/network.svelte.js';
	import { withoutHidden } from '#lib/models/job-mark.js';
	import { marks } from '#lib/network/job-marks.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';
	import { untrack } from 'svelte';

	/**
	 * careers: also link the companies whose jobs are only on their own careers page.
	 * filters: the search, when the page keeps it (in its address).
	 * since: jobs published after it are marked new.
	 * jobs: every job read, for the page.
	 * results: the jobs matching the filters, for the page (a map of them). busy: still reading job boards.
	 * actions: shown under the filters.
	 * search: show the filters (false when the page has its own search).
	 * onselect, selected: open a job in the page (the explorer), and which one is open.
	 * @type {{
	 *   companies: import('#lib/models/company.js').Company[],
	 *   careers?: boolean,
	 *   filters?: import('#lib/models/job.js').JobFilters,
	 *   since?: string,
	 *   jobs?: import('#lib/ats/job.js').Job[],
	 *   results?: import('#lib/ats/job.js').Job[],
	 *   busy?: boolean,
	 *   actions?: import('svelte').Snippet,
	 *   search?: boolean,
	 *   onselect?: (job: import('#lib/ats/job.js').Job) => void,
	 *   selected?: string,
	 *   places?: string[],
	 *   quick?: boolean
	 * }}
	 */
	let {
		companies,
		careers = true,
		filters = $bindable({ query: '', where: '', remote: '' }),
		since = '',
		jobs: all = $bindable([]),
		results = $bindable([]),
		busy = $bindable(false),
		actions,
		search = true,
		onselect,
		selected = '',
		places: suggested = $bindable([]),
		quick = false
	} = $props();
	const PAGE = config.jobs.pageSize;

	/** Jobs read from job boards (or their snapshot). */
	/** @type {import('#lib/ats/job.js').Job[]} */
	let boardJobs = $state.raw([]);
	let answered = $state(0);
	/** Companies whose job board closed. @type {Set<string>} */
	let gone = $state.raw(new Set());
	let grouped = $state(false);
	let shown = $state(PAGE);

	const targets = $derived(companies.filter(hasJobsApi));
	const loading = $derived(answered < targets.length);
	const single = $derived(companies.length === 1);
	const names = $derived(new Map(companies.map((c) => [c.key, c.name])));
	// Offers posted on joblist, for every company here (with a job board or not).
	/** Where posted jobs are, as the snapshot found. @type {Map<string, [number, number]>} */
	let points = $state.raw(new Map());
	const posted = $derived(withPoints(companies.flatMap((c) => data.postedJobs.get(c.key) || []), points));
	// quick: the newest offers shown at once, until every job is read (the explorer, with all companies).
	/** @type {import('#lib/ats/job.js').Job[]} */
	let early = $state.raw([]);
	// Read once, when the list is made: it is how the page starts.
	if (untrack(() => quick)) getSnapshotFirst().then((first) => (early = first.jobs));
	const jobs = $derived(mergeJobs(posted, boardJobs.length ? boardJobs : early));
	$effect(() => {
		all = jobs;
	});
	const sinceTime = $derived(time(since));
	const withoutApi = $derived(careers ? companies.filter((c) => !hasJobsApi(c) && boardUrl(c.jobBoard)) : []);
	// On a company's page, the offers it posted come first. The ones someone hid are left out.
	const matching = $derived(sameOffers(withoutHidden(filterJobs(jobs, filters, names), marks.all)));
	const filtered = $derived(single ? postedFirst(matching) : matching);
	$effect(() => {
		results = filtered;
	});
	$effect(() => {
		busy = loading;
	});
	const offers = $derived(offerCount(jobs));
	const groups = $derived(grouped ? byCompany(filtered) : []);
	// Suggestions are computed once all boards answered, not on every answer.
	const places = $derived(loading ? [] : commonPlaces(jobs));
	$effect(() => {
		suggested = places;
	});
	// A new search starts from its first page.
	$effect(() => {
		[filters.query, filters.where, filters.remote, filters.near, filters.within, filters.area];
		shown = PAGE;
	});

	// The boards to read: the same ones after a refresh of the network are not read again.
	const boards = $derived(JSON.stringify(targets.map((c) => [c.key, c.jobBoard])));
	$effect(() => {
		boards;
		const list = untrack(() => targets);
		let cancelled = false;
		const seen = new Set();
		boardJobs = [];
		answered = 0;
		/** @param {import('#lib/ats/job.js').Job[]} found */
		const add = (found) => {
			const fresh = found.filter((j) => !seen.has(j.url) && seen.add(j.url));
			if (fresh.length) boardJobs = boardJobs.concat(fresh);
		};
		// Boards in the snapshot answer at once; only newer ones are asked live.
		getSnapshotJobs().then((snapshot) => {
			if (cancelled) return;
			const live = snapshot ? list.filter((c) => !snapshot.checked.has(c.key)) : list;
			if (snapshot) {
				gone = snapshot.gone;
				points = snapshot.points;
				add(list.flatMap((c) => snapshot.jobs.get(c.key) || []));
				answered = list.length - live.length;
			}
			mapLimit(live, config.limits.jobsConcurrency, async (company) => {
				const found = await getJobs(company);
				if (cancelled) return;
				add(found);
				answered++;
			});
		});
		return () => (cancelled = true);
	});
</script>

<jl-jobs loading={loading || undefined}>
	{#if loading}
		<progress value={answered} max={targets.length} aria-label={t('jobs.loading')}></progress>
	{/if}
	{#if search && (jobs.length > 10 || actions)}
		<JobFilters bind:filters bind:grouped {places} onchange={() => (shown = PAGE)} />
	{/if}
	<!-- How many, and what to do with them, on one line. -->
	<jl-jobs-bar>
		<p aria-live="polite">
			<small>
				{#if loading && !answered}
					{t('jobs.reading')}
				{:else if loading}
					{t('jobs.progress', { answered, total: targets.length, count: jobs.length })}
				{:else if filtered.length === offers}
					{t('jobs.count', { count: offers })}
				{:else}
					{t('jobs.countFiltered', { count: filtered.length, total: offers })}
				{/if}
			</small>
		</p>
		{@render actions?.()}
	</jl-jobs-bar>

	{#if grouped}
		<ul>
			{#each groups as [key, list] (key)}
				<li><JobGroup {key} name={names.get(key) || key} jobs={list} /></li>
			{/each}
		</ul>
	{:else}
		<ul>
			{#each filtered.slice(0, shown) as job (job.url)}
				<li>
					<JobItem
						{job}
						company={single ? undefined : names.get(job.company)}
						fresh={sinceTime > 0 && time(job.published) > sinceTime}
						onselect={onselect && (() => onselect(job))}
						selected={selected === job.url}
					/>
				</li>
			{/each}
		</ul>
		{#if filtered.length > shown}
			<button type="button" onclick={() => (shown += PAGE)}>
				{t('jobs.more', { count: Math.min(PAGE, filtered.length - shown), left: filtered.length - shown })}
			</button>
		{/if}
	{/if}

	{#if !loading && !filtered.length}
		{#if single && !jobs.length && gone.has(companies[0].key)}
			<!-- Its board closed: say so, and how to find their jobs or fix the link. -->
			<p>
				{t('jobs.gone')}
				{#if companies[0].url}<a href={companies[0].url} target="_blank" rel="noopener">{t('jobs.gone.website')}</a> ·{/if}
				<a href="/add?key={encodeURIComponent(companies[0].key)}">{t('jobs.gone.fix')}</a>
			</p>
		{:else}
			<p>{jobs.length ? t('search.none') : t('jobs.none')}</p>
		{/if}
	{/if}

	{#if withoutApi.length}
		{#if single}
			<p>
				<a href={boardUrl(withoutApi[0].jobBoard)} target="_blank" rel="noopener">{t('jobs.careersPage')}</a>
				<small>{t('jobs.noBoard')}</small>
			</p>
		{:else}
			<details>
				<summary>{t('jobs.withoutBoard', { count: withoutApi.length })}</summary>
				<ul>
					{#each withoutApi as company (company.key)}
						<li><a href={boardUrl(company.jobBoard)} target="_blank" rel="noopener">{company.name}</a></li>
					{/each}
				</ul>
			</details>
		{/if}
	{/if}
</jl-jobs>

<style>
	jl-jobs {
		display: block;
	}
	jl-jobs-bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-xs) var(--space-s);
		margin: var(--space-s) 0 0;
	}
	jl-jobs-bar > p {
		margin: 0;
	}
	jl-jobs > ul {
		margin: var(--space-s) 0;
	}
	details {
		border-bottom: var(--border);
	}
	details li > a {
		display: flex;
		align-items: center;
		min-height: var(--tap-size);
	}
	button {
		width: 100%;
		margin: var(--space-s) 0;
	}
	progress {
		margin-top: var(--space-s);
	}
</style>
