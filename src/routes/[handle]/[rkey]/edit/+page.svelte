<script>
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import ListForm from '#lib/components/ListForm.svelte';
	import RequireSession from '#lib/components/RequireSession.svelte';
	import { session } from '#lib/auth/session.svelte.js';
	import { data } from '#lib/network/network.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	const rkey = $derived(page.params.rkey || '');
	const list = $derived(data.lists.find((l) => l.did === session.did && l.rkey === rkey));
	const back = $derived(`/${page.params.handle}/${rkey}`);
</script>

<h1>{t('form.list.edit')}</h1>
<RequireSession>
	{#if list}
		{#key list.uri}
			<ListForm {list} onsaved={() => goto(back)} oncancel={() => goto(back)} />
		{/key}
	{:else}
		<p>{t('list.notFound')}</p>
	{/if}
</RequireSession>
