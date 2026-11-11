<script>
	import { page } from '$app/state';
	import config from '#lib/data/config.json';
	import ListPage from '#lib/components/ListPage.svelte';
	import DataState from '#lib/components/DataState.svelte';
	import Pending from '#lib/components/Pending.svelte';
	import { refused } from '#lib/atproto/xrpc.js';
	import { data, handleOf, network } from '#lib/network/network.svelte.js';
	import { loadList } from '#lib/network/load-list.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/** A list by its author and key: known from the network, else read from its author's account. */
	const handle = $derived(page.params.handle || '');
	const rkey = $derived(page.params.rkey || '');
	const known = $derived(
		data.lists.find((l) => l.rkey === rkey && (l.did === handle || handleOf(l.did) === handle))
	);
	/** undefined while looking, null when it does not exist. @type {import('#lib/models/list.js').List | null | undefined} */
	let fetched = $state(undefined);
	// Its author's server did not answer: nothing can be said of it.
	let unreachable = $state(false);
	const list = $derived(known || fetched);

	$effect(() => {
		if (known || network.loading || data.status === 'reading') return;
		unreachable = false;
		loadList(handle, rkey)
			.then((l) => (fetched = l))
			.catch((err) => (refused(err) ? (fetched = null) : (unreachable = true)));
	});
</script>

<!-- Its own address: the page served for every handle has none (indexer/site.js). -->
<svelte:head><title>{list?.name || rkey} · {config.name}</title><link rel="canonical" href="{config.url}{page.url.pathname}" /></svelte:head>

{#if list}
	<ListPage {list} />
{:else if unreachable}
	<DataState state="unreachable" />
{:else if fetched === null}
	<h1>{t('list.notFoundTitle')}</h1>
	<p>{t('list.notFound')}</p>
	<menu><a href="/lists">{t('nav.lists')}</a></menu>
{:else}
	<Pending />
{/if}
