<script>
	import config from '#lib/data/config.json';
	import JobFilters from './JobFilters.svelte';
	import JobGroup from './JobGroup.svelte';
	import JobsDialog from './JobsDialog.svelte';
	import { openJob, showJob } from '#lib/navigation/job-open.svelte.js';
	import { byTeam } from '#lib/models/team.js';
	import JobItem from './JobItem.svelte';
	import { getJobs } from '#lib/ats/index.js';
	import { mapLimit } from '#lib/atproto/xrpc.js';
	import { getCompaniesJobs, getSnapshotCounts, getSnapshotFirst, getSnapshotJobs } from '#lib/network/snapshot.js';
	import { afterPaint } from '#lib/navigation/after-paint.js';
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
	 * grouped: by organization, or by team on one organization's page.
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
	 *   quick?: boolean,
	 *   source?: () => Promise<import('#lib/network/snapshot.js').SnapshotJobs | null>
	 * }}
	 * source: where its snapshot jobs come from (a list's own file), instead of the companies' files or every job.
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
		quick = false,
		source
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
	/** Where posted jobs are, as the snapshot found. @type {Map<string, [number, number]>} */
	let points = $state.raw(new Map());
	const posted = $derived(withPoints(companies.flatMap((c) => data.postedJobs.get(c.key) || []), points));
	// quick: the newest offers shown at once, until every job is read (the explorer, with all companies).
	/** @type {import('#lib/ats/job.js').Job[]} */
	let early = $state.raw([]);
	// Read once, when the list is made: it is how the page starts.
	if (untrack(() => quick)) getSnapshotFirst().then((first) => (early = first.jobs));
	/** Jobs read live from boards are among them (not in the snapshot's order). */
	let live = $state(false);
	// Newest first, sorted once here: every search keeps this order. The snapshot's jobs are
	// in that order already: only the jobs posted here or read live need it.
	const jobs = $derived.by(() => {
		const merged = mergeJobs(posted, boardJobs.length ? boardJobs : early);
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
	// One organization: its jobs by team; many: by organization.
	// The organizations with open jobs (not every one listed): "28,294 open jobs at 361 organizations".
	const hiring = $derived(single ? 1 : new Set(jobs.map((j) => j.company)).size);
	const groups = $derived(!grouped ? [] : single ? byTeam(filtered, (field) => t(`field.${field}`)) : byCompany(filtered));
	// Suggestions are computed once all boards answered, not on every answer;
	// in the explorer (every company) the snapshot counted them already.
	/** @type {string[]} */
	let counted = $state.raw([]);
	if (untrack(() => quick)) getSnapshotCounts().then((counts) => (counted = (counts?.places || []).slice(0, config.jobs.placesSuggested).map(([place]) => place)));
	const places = $derived(loading ? [] : counted.length ? counted : commonPlaces(jobs));
	// Every job read in the explorer: they are read for searches while the page is idle.
	$effect(() => {
		if (quick && !loading && jobs.length) prepareSearch(jobs, names);
	});
	$effect(() => {
		suggested = places;
	});
	// A new search starts from its first page.
	$effect(() => {
		[filters.query, filters.where, filters.remote, filters.pay, filters.field, filters.near, filters.within, filters.area, filters.places];
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
		// Boards in the snapshot answer at once; only newer ones are asked live.
		// The explorer first shows the newest jobs: reading all of them takes a phone seconds.
		const ready = untrack(() => quick) ? getSnapshotFirst().then(afterPaint) : Promise.resolve();
		// A company's page, a small list: their own small files, not every job.
		const few = !untrack(() => quick) && list.length <= config.snapshot.companyFiles;
		const read = untrack(() => source) || (few ? () => getCompaniesJobs(list.map((c) => c.key)) : getSnapshotJobs);
		ready.then(read).then((snapshot) => {
			if (cancelled) return;
			const unread = snapshot ? list.filter((c) => !snapshot.checked.has(c.key)) : list;
			if (snapshot) {
				gone = snapshot.gone;
				points = snapshot.points;
				// In the snapshot's order (newest first), so they need no sorting.
				const keys = new Set(list.map((c) => c.key));
				boardJobs = list.length === 1 ? snapshot.jobs.get(list[0].key) || [] : snapshot.all.filter((j) => keys.has(j.company));
				answered = list.length - unread.length;
			}
			// Live, only a few boards: those of a company's page, a small list, organizations added
			// since the snapshot. Never every board: each visitor would ask hundreds of them.
			if (unread.length > config.limits.liveBoards) {
				answered = list.length;
				return;
			}
			mapLimit(unread, config.limits.jobsConcurrency, async (company) => {
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
		<JobFilters bind:filters bind:grouped groupLabel={single ? t('jobs.filter.teams') : undefined} {places} onchange={() => (shown = PAGE)} />
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
					{#if single}<JobGroup name={key || t('jobs.team.none')} jobs={list} {onselect} />{:else}<JobGroup {key} name={names.get(key) || key} jobs={list} {onselect} />{/if}
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
