<script>
	import config from '#lib/data/config.json';
	import CompanyItem from './CompanyItem.svelte';
	import { searchText } from '#lib/models/company.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * @type {{
	 *   companies: import('#lib/models/company.js').Company[],
	 *   searchable?: boolean,
	 *   query?: string,
	 *   aside?: import('svelte').Snippet<[import('#lib/models/company.js').Company]>
	 * }}
	 */
	let { companies, searchable = true, query = $bindable(''), aside } = $props();
	const PAGE = config.companies.pageSize;
	let shown = $state(PAGE);

	const filtered = $derived.by(() => {
		const words = query.toLowerCase().split(/\s+/).filter(Boolean);
		if (!words.length) return companies;
		return companies.filter((c) => {
			const text = searchText(c);
			return words.every((w) => text.includes(w));
		});
	});
</script>

<jl-companies>
	{#if searchable}
		<input
			type="search"
			bind:value={query}
			oninput={() => (shown = PAGE)}
			placeholder={t('search.companies')}
			aria-label={t('search.companies')}
			enterkeyhint="search"
		/>
		{#if query}<p aria-live="polite"><small>{t('companies.found', { count: filtered.length })}</small></p>{/if}
	{/if}
	<ul>
		{#each filtered.slice(0, shown) as company (company.key)}
			<li>
				{#if aside}<CompanyItem {company}>{@render aside(company)}</CompanyItem>{:else}<CompanyItem {company} />{/if}
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
	ul {
		margin: var(--space-s) 0;
	}
	button {
		width: 100%;
	}
</style>
