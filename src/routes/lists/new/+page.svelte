<script>
	import config from '#lib/data/config.json';
	import { page } from '$app/state';
	import { tick } from 'svelte';
	import ListForm from '#lib/components/ListForm.svelte';
	import ListSaved from '#lib/components/ListSaved.svelte';
	import RequireSession from '#lib/components/RequireSession.svelte';
	import { session } from '#lib/auth/session.svelte.js';
	import { data } from '#lib/network/network.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	// /lists/new?copy=at://… starts from a copy of a list; /lists/new?add=key with a company.
	const copy = $derived(page.url.searchParams.get('copy'));
	const add = $derived(page.url.searchParams.get('add'));
	const source = $derived(copy ? data.lists.find((l) => l.uri === copy) : undefined);
	const initial = $derived(
		source
			? { name: source.name, description: source.description, companies: source.companies, copiedFrom: source.uri }
			: { companies: add ? [add] : [] }
	);
	/** @type {{path: string, name: string, count: number} | null} */
	let saved = $state(null);

	/** @param {{rkey: string, name: string}} done */
	async function onsaved({ rkey, name }) {
		const list = data.lists.find((l) => l.did === session.did && l.rkey === rkey);
		saved = { path: `/${session.handle}/${rkey}`, name, count: list?.companies.length ?? 0 };
		await tick();
		scrollTo({ top: 0 });
		const heading = document.querySelector('jl-list-saved h1');
		if (heading instanceof HTMLElement) heading.focus();
	}
	// Another copy or company: the form again.
	$effect(() => {
		void page.url.search;
		saved = null;
	});
</script>

<svelte:head><title>{saved ? saved.name : t('form.list.title')} · {config.name}</title></svelte:head>

{#if saved}
	<ListSaved {...saved} />
{:else}
	<h1>{t('form.list.title')}</h1>
	<p><small>{t('form.list.intro')}</small></p>
	<RequireSession>
		{#key initial}
			<ListForm {initial} {onsaved} oncancel={() => history.back()} />
		{/key}
	</RequireSession>
{/if}
