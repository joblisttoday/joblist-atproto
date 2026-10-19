<script>
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import ListForm from '#lib/components/ListForm.svelte';
	import RequireSession from '#lib/components/RequireSession.svelte';
	import { session } from '#lib/auth/session.svelte.js';
	import { data } from '#lib/network/network.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	const copy = $derived(page.url.searchParams.get('copy'));
	const add = $derived(page.url.searchParams.get('add'));
	const source = $derived(copy ? data.lists.find((l) => l.uri === copy) : undefined);
	const initial = $derived(
		source
			? { name: source.name, description: source.description, companies: source.companies, copiedFrom: source.uri }
			: { companies: add ? [add] : [] }
	);
</script>

<h1>{t('form.list.title')}</h1>
<RequireSession>
	{#key initial}
		<ListForm {initial} onsaved={(rkey) => goto(`/${session.handle}/${rkey}`)} oncancel={() => history.back()} />
	{/key}
</RequireSession>
