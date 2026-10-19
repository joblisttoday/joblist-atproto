<script>
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import config from '#lib/data/config.json';
	import Author from '#lib/components/Author.svelte';
	import Companies from '#lib/components/Companies.svelte';
	import CompanyMap from '#lib/components/CompanyMap.svelte';
	import Jobs from '#lib/components/Jobs.svelte';
	import Tabs from '#lib/components/Tabs.svelte';
	import { deleteRecord } from '#lib/atproto/write.js';
	import { session } from '#lib/auth/session.svelte.js';
	import { data, handleOf, network, removeLocal } from '#lib/network/network.svelte.js';
	import { loadList } from '#lib/network/load-list.js';
	import { parseUri } from '#lib/models/list.js';
	import { t } from '#lib/i18n/index.svelte.js';

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

	let tab = $state('companies');
	let copied = $state(false);
	const companies = $derived(
		(list?.companies || []).map((key) => data.companies.get(key)).filter((c) => c !== undefined)
	);
	const missing = $derived((list?.companies.length || 0) - companies.length);
	const mine = $derived(list?.did === session.did);
	const source = $derived(list?.copiedFrom ? parseUri(list.copiedFrom) : null);

	async function share() {
		const url = window.location.href;
		if (navigator.share) {
			await navigator.share({ title: list?.name, url }).catch(() => {});
		} else {
			await navigator.clipboard.writeText(url);
			copied = true;
		}
	}

	async function remove() {
		if (!list || !confirm(t('list.confirmDelete'))) return;
		await deleteRecord(config.collections.list, list.rkey);
		removeLocal('list', list.uri);
		await goto('/me');
	}
</script>

<svelte:head><title>{list?.name || rkey} · {config.name}</title></svelte:head>

{#if list}
	<jl-list-page mine={mine || undefined}>
		<header>
			<h1>{list.name}</h1>
			<p>
				<small>
					{t('list.companies', { count: list.companies.length })} · {t('list.by')} <Author did={list.did} />
					{#if source}· {t('list.copiedFrom')} <a href="/{handleOf(source.did)}/{source.rkey}">@{handleOf(source.did)}</a>{/if}
				</small>
			</p>
			{#if list.description}<p>{list.description}</p>{/if}
			<menu>
				<button type="button" onclick={share}>{copied ? t('list.linkCopied') : t('list.share')}</button>
				<a href={session.did ? `/lists/new?copy=${encodeURIComponent(list.uri)}` : '/signin'}>{t('list.copy')}</a>
				{#if mine}
					<a href="/{handle}/{list.rkey}/edit">{t('list.edit')}</a>
					<button type="button" onclick={remove}>{t('list.delete')}</button>
				{/if}
			</menu>
		</header>

		<Tabs
			tabs={[
				{ id: 'companies', label: t('list.tab.companies') },
				{ id: 'jobs', label: t('list.tab.jobs') },
				{ id: 'map', label: t('list.tab.map') }
			]}
			bind:current={tab}
		/>

		{#if tab === 'jobs'}
			<Jobs {companies} />
		{:else if tab === 'map'}
			<CompanyMap {companies} />
		{:else}
			<Companies {companies} searchable={companies.length > 10} />
		{/if}
		{#if missing > 0}<p><small>{t('list.missing', { count: missing })}</small></p>{/if}
	</jl-list-page>
{:else if fetched === null}
	<p>{t('list.notFound')}</p>
{:else}
	<p><small>{t('network.loading')}</small></p>
{/if}

<style>
	jl-list-page {
		display: block;
	}
	menu {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-m);
		padding: 0;
	}
</style>
