<script>
	import config from '#lib/data/config.json';
	import ListPage from '#lib/components/ListPage.svelte';
	import { readAddress } from '#lib/navigation/address.js';
	import { sharedList } from '#lib/models/list.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * A list someone sent as a link: the list is in the link, after the "#" (lists/shared#name=…&orgs=…),
	 * which browsers never send: nothing is published, nothing kept, until "Keep a copy".
	 */
	const params = readAddress(['name', 'about', 'orgs']);
	const list = sharedList(params);
	/** What the page keeps after the "#", with its own search and view. */
	const address = Object.fromEntries(params);
</script>

<svelte:head><title>{list?.name || t('list.shared.title')} · {config.name}</title></svelte:head>

{#if list}
	<ListPage {list} {address} />
{:else}
	<h1>{t('list.shared.title')}</h1>
	<p>{t('list.shared.none')}</p>
	<menu><a href="/lists">{t('nav.lists')}</a></menu>
{/if}
