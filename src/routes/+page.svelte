<script>
	import ListItem from '#lib/components/ListItem.svelte';
	import { data, network } from '#lib/network/network.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	let query = $state('');
	// Biggest lists first: they are the best way in for a first visit.
	const sorted = $derived([...data.lists].sort((a, b) => b.companies.length - a.companies.length));
	const lists = $derived.by(() => {
		const q = query.toLowerCase().trim();
		if (!q) return sorted;
		return sorted.filter((l) => `${l.name} ${l.description || ''}`.toLowerCase().includes(q));
	});
</script>

<jl-home>
	<header>
		<h1>{t('home.title')}</h1>
		<p>{t('home.intro')}</p>
		<menu>
			<a href="/jobs">{t('home.jobs')}</a>
			<a href="/companies">{t('home.companies')}</a>
		</menu>
	</header>

	<section aria-labelledby="home-lists">
		<header>
			<h2 id="home-lists">{t('nav.lists')}</h2>
			<a href="/lists/new">+ {t('list.new')}</a>
		</header>
		{#if data.lists.length > 6}
			<input type="search" bind:value={query} placeholder={t('search.lists')} aria-label={t('search.lists')} />
		{/if}
		{#if lists.length}
			<ul>
				{#each lists as list (list.uri)}
					<li><ListItem {list} /></li>
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
		padding: var(--space-l) 0 0;
	}
	h1 {
		margin-top: 0;
	}
	jl-home > header > p {
		color: var(--color-muted);
		max-width: 34em;
	}
	jl-home > header menu {
		display: grid;
		grid-template-columns: 1fr 1fr;
	}
	menu > a:first-child {
		background: var(--color-accent);
		color: var(--color-accent-fg);
		border-color: var(--color-accent);
	}
	section > header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-m);
	}
	section > header > a {
		display: flex;
		align-items: center;
		min-height: var(--tap-size);
	}
	@media (min-width: 48rem) {
		jl-home > header menu {
			display: flex;
		}
		ul {
			display: grid;
			grid-template-columns: 1fr 1fr;
			column-gap: var(--space-l);
		}
	}
</style>
