<script>
	import { page } from '$app/state';
	import config from '#lib/data/config.json';
	import ListPage from '#lib/components/ListPage.svelte';
	import Pending from '#lib/components/Pending.svelte';
	import { data, handleOf, network } from '#lib/network/network.svelte.js';
	import { loadList } from '#lib/network/load-list.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/** A list by its author and key: known from the network, else read from its author's account. */
	const handle = $derived(page.params.handle || '');
	const rkey = $derived(page.params.rkey || '');
	const known = $derived(
		data.lists.find((l) => l.rkey === rkey && (l.did === handle || handleOf(l.did) === handle))
	);
	/** @type {import('#lib/models/list.js').List | null | undefined} */
	let fetched = $state(undefined);
	const list = $derived(known || fetched);

	$effect(() => {
		if (known || network.loading) return;
		loadList(handle, rkey)
			.then((l) => (fetched = l))
			.catch(() => (fetched = null));
	});
</script>

<svelte:head><title>{list?.name || rkey} · {config.name}</title></svelte:head>

{#if list}
	<ListPage {list} />
{:else if fetched === null}
	<h1>{t('list.notFoundTitle')}</h1>
	<p>{t('list.notFound')}</p>
	<menu><a href="/lists">{t('nav.lists')}</a></menu>
{:else}
	<Pending />
{/if}
