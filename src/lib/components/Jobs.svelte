<script>
	import config from '#lib/data/config.json';
	import JobFilters from './JobFilters.svelte';
	import JobGroup from './JobGroup.svelte';
	import JobsDialog from './JobsDialog.svelte';
	import { openJob, showJob } from '#lib/navigation/job-open.svelte.js';
	import JobItem from './JobItem.svelte';
	import { getJobs } from '#lib/ats/index.js';
	import { mapLimit } from '#lib/atproto/xrpc.js';
	import { prepareSearch } from '#lib/network/prepare-search.js';
	import { boardUrl, hasJobsApi } from '#lib/models/company.js';
	import { byCompany, commonPlaces, filterJobs, newestFirst, offerCount, placeNewest, sameOffers, spread, time } from '#lib/models/job.js';
	import { mergeJobs, postedFirst, withPoints } from '#lib/models/job-post.js';
	import { data } from '#lib/network/network.svelte.js';
	import { withoutHidden } from '#lib/models/job-mark.js';
	import { hiddenJobs } from '#lib/network/job-collections.svelte.js';
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
	 * grouped: by organization.
	 * onselect, selected: open a job in the page (the explorer), and which one is open;
	 *   by default, a job opens in a dialog over the list (JobsDialog).
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
	 *   grouped?: boolean,
	 *   onselect?: (job: import('#lib/ats/job.js').Job) => void,
	 *   selected?: string,
	 *   places?: string[],
	 *   quick?: boolean
	 * }}
	 * quick: the explorer's (its jobs are prepared for searching while the page is idle).
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
		grouped = $bindable(false),
		onselect: pageSelect,
		selected: pageSelected = '',
		places: suggested = $bindable([]),
		quick = false
	} = $props();
	const PAGE = config.jobs.pageSize;
	// The page opens a job itself (the explorer), or it opens in the dialog over the list.
	const own = $derived(!pageSelect);
	/** @param {import('#lib/ats/job.js').Job} job */
	const onselect = (job) => (pageSelect || showJob)(job);
	const selected = $derived(own ? openJob()?.url || '' : pageSelected);

	/** Jobs read from job boards (or their snapshot). */
	/** @type {import('#lib/ats/job.js').Job[]} */
	let boardJobs = $state.raw([]);
	let answered = $state(0);
	/** Companies whose job board closed. @type {Set<string>} */
	let gone = $state.raw(new Set());
	let shown = $state(PAGE);

	const targets = $derived(companies.filter(hasJobsApi));
	const loading = $derived(answered < targets.length);
	const single = $derived(companies.length === 1);
	const names = $derived(new Map(companies.map((c) => [c.key, c.name])));
	// Offers posted on joblist, for every company here (with a job board or not).
	const posted = $derived(withPoints(companies.flatMap((c) => data.postedJobs.get(c.key) || []), new Map()));
	/** Jobs read live from boards are among them. */
	let live = $state(false);
	// Newest first, sorted once here: every search keeps this order.
	const jobs = $derived.by(() => {
		const merged = mergeJobs(posted, boardJobs);
		if (live) newestFirst(merged);
		else if (posted.length) return placeNewest(merged.filter((j) => !j.posted), merged.filter((j) => j.posted));
		return merged;
	});
	$effect(() => {
		all = jobs;
	});
	const sinceTime = $derived(time(since));
	const withoutApi = $derived(careers ? companies.filter((c) => !hasJobsApi(c) && boardUrl(c.jobBoard)) : []);
	// On a company's page, the offers it posted come first. The ones someone hid are left out.
	const visible = $derived(withoutHidden(filterJobs(jobs, filters, names), hiddenJobs()));
	const matching = $derived(sameOffers(visible));
	// Many companies: they take turns (config.jobs.spread), unless sorted by distance from someone.
	const filtered = $derived(single ? postedFirst(matching) : filters.near ? matching : spread(matching, config.jobs.spread));
	$effect(() => {
		results = filtered;
	});
	$effect(() => {
		busy = loading;
	});
	// Nothing left out: the offers are those matching, kept for when a search leaves some out
	// (counting tens of thousands of jobs again would slow the first search).
	/** @type {{jobs: import('#lib/ats/job.js').Job[] | null, count: number}} */
	let unfiltered = { jobs: null, count: 0 };
	const allOffers = $derived(offerCount(jobs));
	const offers = $derived.by(() => {
		if (visible === jobs) unfiltered = { jobs, count: matching.length };
		return unfiltered.jobs === jobs ? unfiltered.count : allOffers;
	});
	// The organizations with open jobs (not every one listed): "28,294 open jobs at 361 organizations".
	const hiring = $derived(single ? 1 : new Set(jobs.map((j) => j.company)).size);
	// Grouped: by organization.
	const groups = $derived(grouped ? byCompany(filtered) : []);
	// Suggestions are computed once all boards answered, not on every answer;
	// in the explorer (every company) the snapshot counted them already.
	const places = $derived(loading ? [] : commonPlaces(jobs));
	// Every job read in the explorer: they are read for searches while the page is idle.
	$effect(() => {
		if (quick && !loading && jobs.length) prepareSearch(jobs, names);
	});
	$effect(() => {
		suggested = places;
	});
	// A new search starts from its first page.
	$effect(() => {
		[filters.query, filters.where, filters.remote, filters.pay, filters.field, filters.team, filters.near, filters.within, filters.area, filters.places];
		shown = PAGE;
	});

	// The boards to read: the same ones after a refresh of the network are not read again.
	const boards = $derived(JSON.stringify(targets.map((c) => [c.key, c.jobBoard])));
	$effect(() => {
		boards;
		const list = untrack(() => targets);
		let cancelled = false;
		/** @type {Set<string> | null} */
		let seen = null;
		boardJobs = [];
		answered = 0;
		live = false;
		/** @param {import('#lib/ats/job.js').Job[]} found */
		const add = (found) => {
			// The snapshot has each link once: only jobs read live are compared with those known.
			seen ??= new Set(boardJobs.map((j) => j.url));
			const fresh = found.filter((j) => !seen?.has(j.url) && seen?.add(j.url));
			if (!fresh.length) return;
			boardJobs = boardJobs.concat(fresh);
			live = true;
		};
		// Live, from each board (kept for the browser session, ats/index.js): at most
		// config.kept.boardsPerVisit of them, never every board at once.
		const asked = list.slice(0, config.kept.boardsPerVisit);
		answered = list.length - asked.length;
		mapLimit(asked, config.limits.jobsConcurrency, async (company) => {
			const found = await getJobs(company);
			if (cancelled) return;
			add(found);
			answered++;
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
				{:else if filtered.length === offers && !single}
					{t('jobs.countAt', { count: offers, companies: hiring })}
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
				<li>
					<JobGroup {key} name={names.get(key) || key} jobs={list} {onselect} />
				</li>
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
						onselect={() => onselect(job)}
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
	{#if own}<JobsDialog jobs={filtered} all={jobs} {names} done={!loading} />{/if}
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
