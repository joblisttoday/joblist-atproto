<script>
	import ListItem from '#lib/components/ListItem.svelte';
	import NetworkStatus from '#lib/components/NetworkStatus.svelte';
	import { data } from '#lib/network/network.svelte.js';
	import { session } from '#lib/auth/session.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	let query = $state('');
	const lists = $derived.by(() => {
		const q = query.toLowerCase().trim();
		if (!q) return data.lists;
		return data.lists.filter((l) => `${l.name} ${l.description || ''}`.toLowerCase().includes(q));
	});
</script>

<header>
	<h1>{t('home.title')}</h1>
	<p>{t('home.intro')}</p>
	<menu>
		<a href={'/lists/new'}>+ {t('list.new')}</a>
	</menu>
</header>

<input type="search" bind:value={query} placeholder={t('search.lists')} aria-label={t('search.lists')} />
<NetworkStatus />

{#if lists.length}
	<ul>
		{#each lists as list (list.uri)}
			<li><ListItem {list} /></li>
		{/each}
	</ul>
{:else}
	<p>{t('home.empty')}</p>
{/if}
