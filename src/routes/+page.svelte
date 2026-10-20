<script>
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
	<header>
		<h1>{t('home.title')}</h1>
		<p>{t('home.intro')}</p>
		<menu><a href="/lists/new">+ {t('list.new')}</a></menu>
	</header>

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
	jl-home > header {
		padding: var(--space-m) 0 0;
	}
	jl-home > header > p {
		color: var(--color-muted);
		max-width: 34em;
		margin-bottom: 0;
	}
	@media (min-width: 48rem) {
		ul {
			display: grid;
			grid-template-columns: 1fr 1fr;
			column-gap: var(--space-l);
		}
	}
</style>
