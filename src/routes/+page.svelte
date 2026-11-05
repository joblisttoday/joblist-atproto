<script>
	import PageHeader from '#lib/components/PageHeader.svelte';
	import ListItem from '#lib/components/ListItem.svelte';
	import { data, network } from '#lib/network/network.svelte.js';
	import { mixedAuthors } from '#lib/models/list.js';
	import { t } from '#lib/i18n/index.svelte.js';

	let query = $state('');
	// Biggest lists first: they are the best way in for a first visit.
	const sorted = $derived([...data.lists].sort((a, b) => b.companies.length - a.companies.length));
	const lists = $derived.by(() => {
		const q = query.toLowerCase().trim();
		if (!q) return sorted;
		return sorted.filter((l) => `${l.name} ${l.description || ''}`.toLowerCase().includes(q));
	});
	const author = $derived(mixedAuthors(sorted));
</script>

<jl-home>
	<PageHeader title={t('home.title')} intro={t('home.intro')}>
		{#snippet actions()}<a href="/lists/new">+ {t('list.new')}</a>{/snippet}
	</PageHeader>

	<section aria-label={t('nav.lists')}>
		{#if data.lists.length > 6}
			<input type="search" bind:value={query} placeholder={t('search.lists')} aria-label={t('search.lists')} />
		{/if}
		{#if lists.length}
			<ul>
				{#each lists as list (list.uri)}
					<li><ListItem {list} {author} /></li>
				{/each}
			</ul>
		{:else if !network.loading}
			<p>{query ? t('search.none') : t('home.empty')}</p>
		{/if}
	</section>
</jl-home>

<style>
	jl-home {
		display: block;
	}
	input {
		margin-bottom: var(--space-s);
	}
	ul {
		display: grid;
		grid-template-columns: var(--columns);
		column-gap: var(--column-gap);
	}
</style>
