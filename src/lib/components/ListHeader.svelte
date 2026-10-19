<script>
	import { goto } from '$app/navigation';
	import config from '#lib/data/config.json';
	import Author from './Author.svelte';
	import { deleteRecord } from '#lib/atproto/write.js';
	import { session } from '#lib/auth/session.svelte.js';
	import { handleOf, removeLocal } from '#lib/network/network.svelte.js';
	import { parseUri } from '#lib/models/list.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/** @type {{list: import('#lib/models/list.js').List}} */
	let { list } = $props();

	let copied = $state(false);
	/** @type {string | null} */
	let error = $state(null);
	const mine = $derived(list.did === session.did);
	const source = $derived(list.copiedFrom ? parseUri(list.copiedFrom) : null);

	async function share() {
		const url = window.location.origin + window.location.pathname;
		if (navigator.share) {
			await navigator.share({ title: list.name, url }).catch(() => {});
		} else {
			await navigator.clipboard.writeText(url);
			copied = true;
			setTimeout(() => (copied = false), 3000);
		}
	}

	async function remove() {
		if (!confirm(t('list.confirmDelete'))) return;
		try {
			await deleteRecord(config.collections.list, list.rkey);
			removeLocal('list', list.uri);
			await goto('/me');
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
		}
	}
</script>

<jl-list-header mine={mine || undefined}>
	<header>
		<h1>{list.name}</h1>
		{#if list.description}<p>{list.description}</p>{/if}
		<p>
			<small>
				{t('list.companies', { count: list.companies.length })} · {t('list.by')} <Author did={list.did} />
				{#if source}
					· {t('list.copiedFrom')} <a href="/{handleOf(source.did)}/{source.rkey}">@{handleOf(source.did)}</a>
				{/if}
			</small>
		</p>
		<menu>
			<button type="button" onclick={share}>{copied ? t('list.linkCopied') : t('list.share')}</button>
			{#if mine}
				<a href="/{handleOf(list.did)}/{list.rkey}/edit">{t('list.edit')}</a>
				<button type="button" onclick={remove}>{t('list.delete')}</button>
			{:else}
				<a href="/lists/new?copy={encodeURIComponent(list.uri)}">{t('list.copy')}</a>
			{/if}
		</menu>
		{#if error}<p role="alert">{error}</p>{/if}
	</header>
</jl-list-header>

<style>
	jl-list-header {
		display: block;
	}
	h1 {
		margin-bottom: var(--space-xs);
	}
	p {
		margin-bottom: var(--space-s);
	}
	menu {
		margin: var(--space-s) 0 0;
	}
	menu > * {
		min-height: var(--tap-size);
		padding: 0 var(--space-m);
		font-size: var(--font-size-small);
	}
</style>
