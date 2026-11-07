<script>
	import Icon from '#lib/components/Icon.svelte';
	import { page } from '$app/state';
	import { replaceState } from '$app/navigation';
	import config from '#lib/data/config.json';
	import Companies from '#lib/components/Companies.svelte';
	import CompanyMap from '#lib/components/CompanyMap.svelte';
	import ViewSwitch from '#lib/components/ViewSwitch.svelte';
	import { findCompanies } from '#lib/models/company-filters.js';
	import { data } from '#lib/network/network.svelte.js';
	import { allAccounts } from '#lib/network/accounts.svelte.js';
	import { getSnapshotJobs } from '#lib/network/snapshot.js';
	import { readView } from '#lib/navigation/explore-view.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Every company, like the jobs page: a search bar at the top (words, hiring,
	 * on Bluesky, and how to show them), the companies using the whole screen under it.
	 */
	const params = page.url.searchParams;
	// A tag or place link can open this page already searched (?q=…); ?tab=map is the map.
	let query = $state(params.get('q') || '');
	let hiring = $state(false);
	let bluesky = $state(false);
	let view = $state(params.get('tab') === 'map' ? 'map' : readView('companies', 'grid'));

	const companies = $derived([...data.companies.values()]);
	// How many jobs each company has open, as of the last snapshot.
	/** @type {Map<string, number>} */
	let counts = $state.raw(new Map());
	getSnapshotJobs().then((snapshot) => {
		if (snapshot) counts = new Map([...snapshot.jobs].map(([key, jobs]) => [key, jobs.length]));
	});
	const accounts = $derived(allAccounts());
	const found = $derived(findCompanies(companies, { query, hiring, bluesky }, counts, accounts));
	const hiringCount = $derived(companies.filter((c) => counts.get(c.key)).length);
	const blueskyCount = $derived(companies.filter((c) => accounts.has(c.key)).length);
	// Adding a company starts from what was searched.
	const addHref = $derived(query.trim() ? `/add?${new URLSearchParams({ url: query.trim() })}` : '/add');

	// The search stays in the address, to share or come back to.
	$effect(() => {
		const next = new URL(location.href);
		if (query.trim()) next.searchParams.set('q', query.trim());
		else next.searchParams.delete('q');
		next.searchParams.delete('tab');
		if (next.href !== location.href) replaceState(next, {});
	});
</script>

<svelte:head><title>{t('companies.title')} · {config.name}</title></svelte:head>

<jl-companies-page {view}>
	<jl-companies-bar>
		<form role="search" onsubmit={(e) => e.preventDefault()}>
			<input type="search" bind:value={query} placeholder={t('search.companies')} aria-label={t('search.companies')} enterkeyhint="search" />
			<jl-companies-chips>
				<menu aria-label={t('companies.filters')}>
					<li>
						<button type="button" aria-pressed={hiring} onclick={() => (hiring = !hiring)}>
							<Icon name="jobs" /> {t('companies.hiring')} <small>{hiringCount}</small>
						</button>
					</li>
					{#if blueskyCount}
						<li>
							<button type="button" aria-pressed={bluesky} onclick={() => (bluesky = !bluesky)}>
								{t('companies.onBluesky')} <small>{blueskyCount}</small>
							</button>
						</li>
					{/if}
				</menu>
				<ViewSwitch bind:view page="companies" />
			</jl-companies-chips>
		</form>
	</jl-companies-bar>

	<jl-companies-stage>
		{#if view === 'map'}
			<CompanyMap companies={found} full />
		{:else}
			<jl-companies-results>
				<p>
					<small aria-live="polite">{t('companies.count', { count: found.length.toLocaleString(), total: companies.length.toLocaleString() })}</small>
					<a href={addHref}><Icon name="add" /> {t('companies.add')}</a>
				</p>
				<Companies companies={found} {counts} searchable={false} layout={view === 'list' ? 'list' : 'grid'} />
				{#if !found.length}
					<jl-companies-empty>
						<p>{t('search.none')}</p>
						{#if query.trim()}
							<p>{t('companies.missing')}</p>
							<menu><a href={addHref}><Icon name="add" /> {t('companies.add.named', { name: query.trim() })}</a></menu>
						{/if}
					</jl-companies-empty>
				{/if}
			</jl-companies-results>
		{/if}
	</jl-companies-stage>
</jl-companies-page>

<style>
	/* The whole screen under the header and above the navigation: the bar, then the companies. */
	jl-companies-page {
		position: fixed;
		inset: var(--header-height) 0 calc(var(--nav-height) + env(safe-area-inset-bottom)) 0;
		z-index: 1;
		display: flex;
		flex-direction: column;
		background: var(--color-bg);
	}
	jl-companies-bar {
		flex: none;
		padding: var(--space-s) var(--gutter);
		border-bottom: var(--border);
	}
	form {
		display: grid;
		gap: var(--space-s);
	}
	jl-companies-chips {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		min-width: 0;
	}
	menu {
		flex: 1;
		min-width: 0;
		flex-wrap: nowrap;
		margin: 0;
		gap: var(--space-xs);
		overflow-x: auto;
		scrollbar-width: none;
	}
	menu > li {
		flex: none;
	}
	menu button {
		min-height: var(--chip-height);
		padding: 0 var(--space-m);
		border-radius: var(--radius-round);
		font-size: var(--font-size-small);
	}
	menu button[aria-pressed='true'] {
		background: var(--color-accent);
		color: var(--color-accent-fg);
		border-color: var(--color-accent);
	}
	menu small {
		opacity: 0.7;
	}
	jl-companies-stage {
		position: relative;
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		overscroll-behavior: contain;
	}
	jl-companies-page[view='map'] jl-companies-stage {
		overflow: hidden;
	}
	jl-companies-results {
		display: block;
		padding: 0 var(--gutter) var(--space-l);
	}
	jl-companies-results > p {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-s);
		margin: var(--space-s) 0 0;
		color: var(--color-muted);
	}
	jl-companies-results > p > a {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
		font-size: var(--font-size-small);
	}

	/* Nothing found: an invitation to add what was searched. */
	jl-companies-empty {
		display: block;
		margin-top: var(--space-m);
	}
	jl-companies-empty p {
		margin: 0 0 var(--space-xs);
	}
	jl-companies-empty menu {
		margin: var(--space-s) 0;
		overflow: visible;
	}
	jl-companies-empty menu > a {
		background: var(--color-accent);
		color: var(--color-accent-fg);
		border-color: var(--color-accent);
	}

	/* Wide screens: the whole bar on one row; no navigation at the bottom. */
	@media (min-width: 48rem) {
		jl-companies-page {
			bottom: 0;
		}
	}
	@media (min-width: 64rem) {
		form {
			grid-template-columns: minmax(0, 1fr) auto;
		}
	}
</style>
