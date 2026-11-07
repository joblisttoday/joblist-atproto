<script>
	import config from '#lib/data/config.json';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import ListForm from '#lib/components/ListForm.svelte';
	import RequireSession from '#lib/components/RequireSession.svelte';
	import { session } from '#lib/auth/session.svelte.js';
	import { data } from '#lib/network/network.svelte.js';
	import { LOCAL } from '#lib/models/list.js';
	import { t } from '#lib/i18n/index.svelte.js';

	// Only its author edits a list: their own lists are the ones looked in (those on this device too).
	const rkey = $derived(page.params.rkey || '');
	const local = $derived(page.params.handle === LOCAL);
	const list = $derived(data.lists.find((l) => (local ? l.did === LOCAL : l.did === session.did) && l.rkey === rkey));
	const back = $derived(`/${page.params.handle}/${rkey}`);
</script>

<svelte:head><title>{t('form.list.edit')} · {config.name}</title></svelte:head>

<h1>{t('form.list.edit')}</h1>
{#snippet editing()}
	{#if list}
		{#key list.uri}
			<!-- Published from this device: its page is now in the account. -->
			<ListForm {list} onsaved={(s) => goto(s.local ? back : `/${session.handle}/${s.rkey}`)} oncancel={() => goto(back)} />
		{/key}
	{:else}
		<p>{t('list.notFound')}</p>
	{/if}
{/snippet}
{#if local}{@render editing()}{:else}<RequireSession>{@render editing()}</RequireSession>{/if}
