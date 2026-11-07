<script>
	import config from '#lib/data/config.json';
	import CompanyItem from './CompanyItem.svelte';
	import { searchText } from '#lib/models/company.js';
	import { allAccounts } from '#lib/network/accounts.svelte.js';
	import Icon from './Icon.svelte';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * @type {{
	 *   companies: import('#lib/models/company.js').Company[],
	 *   searchable?: boolean,
	 *   query?: string,
	 *   counts?: Map<string, number>,
	 *   aside?: import('svelte').Snippet<[import('#lib/models/company.js').Company]>,
	 *   layout?: 'grid' | 'list'
	 * }}
	 *   layout: cards in columns (grid), or one company a row across the width (list).
	 */
	let { companies, searchable = true, query = $bindable(''), counts, aside, layout = 'grid' } = $props();
	const PAGE = config.companies.pageSize;
	let shown = $state(PAGE);
	// Only the companies on Bluesky (their domain is their handle).
	let bluesky = $state(false);
	const accounts = $derived(allAccounts());
	const onBluesky = $derived(companies.filter((c) => accounts.has(c.key)).length);

	const filtered = $derived.by(() => {
		const words = query.toLowerCase().split(/\s+/).filter(Boolean);
		const pool = bluesky ? companies.filter((c) => accounts.has(c.key)) : companies;
		if (!words.length) return pool;
		return pool.filter((c) => {
			const text = searchText(c);
			return words.every((w) => text.includes(w));
		});
	});
</script>

<jl-companies {layout}>
	{#if searchable}
		<input
			type="search"
			bind:value={query}
			oninput={() => (shown = PAGE)}
			placeholder={t('search.companies')}
			aria-label={t('search.companies')}
			enterkeyhint="search"
		/>
		{#if onBluesky}
			<jl-companies-filters>
				<button type="button" aria-pressed={bluesky} onclick={() => ((bluesky = !bluesky), (shown = PAGE))}>
					{#if bluesky}<Icon name="added" />{/if}
					{t('companies.onBluesky')} <small>{onBluesky}</small>
				</button>
			</jl-companies-filters>
		{/if}
		{#if query || bluesky}<p aria-live="polite"><small>{t('companies.found', { count: filtered.length })}</small></p>{/if}
	{/if}
	<ul>
		{#each filtered.slice(0, shown) as company (company.key)}
			<li>
				{#if aside}<CompanyItem {company} jobs={counts?.get(company.key)}>{@render aside(company)}</CompanyItem>{:else}<CompanyItem {company} jobs={counts?.get(company.key)} />{/if}
			</li>
		{/each}
	</ul>
	{#if query && !filtered.length}<p>{t('search.none')}</p>{/if}
	{#if filtered.length > shown}
		<button type="button" onclick={() => (shown += PAGE)}>
			{t('companies.more', { count: Math.min(PAGE, filtered.length - shown), left: filtered.length - shown })}
		</button>
	{/if}
</jl-companies>

<style>
	jl-companies {
		display: block;
	}
	p {
		margin: var(--space-s) 0 0;
	}
	jl-companies[layout='list'] ul {
		grid-template-columns: 1fr;
	}
	ul {
		display: grid;
		grid-template-columns: var(--columns);
		column-gap: var(--column-gap);
		margin: var(--space-s) 0;
	}
	jl-companies > button {
		width: 100%;
	}
	jl-companies-filters {
		display: flex;
		gap: var(--space-xs);
		margin-top: var(--space-s);
	}
	jl-companies-filters button {
		min-height: var(--chip-height);
		padding: 0 var(--space-m);
		border-radius: var(--radius-round);
		font-size: var(--font-size-small);
	}
	jl-companies-filters button[aria-pressed='true'] {
		background: var(--color-fg);
		color: var(--color-bg);
		border-color: var(--color-fg);
	}
</style>
