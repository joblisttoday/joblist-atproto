<script>
	import CompanyItem from './CompanyItem.svelte';
	import { searchText } from '#lib/models/company.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/** @type {{companies: import('#lib/models/company.js').Company[], searchable?: boolean}} */
	let { companies, searchable = true } = $props();
	let query = $state('');
	let shown = $state(100);

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
		<input type="search" bind:value={query} placeholder={t('search.companies')} aria-label={t('search.companies')} />
	{/if}
	<ul>
		{#each filtered.slice(0, shown) as company (company.key)}
			<li><CompanyItem {company} /></li>
		{/each}
	</ul>
	{#if filtered.length > shown}
		<button type="button" onclick={() => (shown += 100)}>{filtered.length - shown} +</button>
	{/if}
</jl-companies>

<style>
	jl-companies {
		display: block;
	}
	ul {
		margin: var(--space-s) 0;
	}
	button {
		width: 100%;
	}
</style>
