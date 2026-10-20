<script>
	import { goto } from '$app/navigation';
	import config from '#lib/data/config.json';
	import Author from './Author.svelte';
	import { deleteRecord } from '#lib/atproto/write.js';
	import { session } from '#lib/auth/session.svelte.js';
	import { handleOf, removeLocal } from '#lib/network/network.svelte.js';
	import { parseUri } from '#lib/models/list.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * The list's one header: what it is, one meta line, one row of actions.
	 * suggesting: whether "Suggest a company" is open below (for others than the author).
	 * @type {{list: import('#lib/models/list.js').List, count?: number, suggesting?: boolean}}
	 */
	let { list, count, suggesting = $bindable(false) } = $props();

	let copied = $state(false);
	/** @type {string | null} */
	let error = $state(null);
	const mine = $derived(list.did === session.did);
	const source = $derived(list.copiedFrom ? parseUri(list.copiedFrom) : null);
	const path = $derived(`/${handleOf(list.did)}/${list.rkey}`);
	// Signed out, "Suggest" signs in first and comes back here with it open.
	const signin = $derived(`/signin?${new URLSearchParams({ next: `${path}?suggest` })}`);

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
			await goto(`/${session.handle}`);
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
		}
	}
</script>

<jl-list-header mine={mine || undefined} open={list.open || undefined}>
	<header>
		<h1>{list.name}</h1>
		{#if list.description}<p>{list.description}</p>{/if}
		<p>
			<small>
				{t('list.companies', { count: count ?? list.companies.length })} · {t('list.by')} <Author did={list.did} />
				· {list.open ? t('list.open') : t('list.closed')}
				{#if source}
					· {t('list.copiedFrom')} <a href="/{handleOf(source.did)}/{source.rkey}">@{handleOf(source.did)}</a>
				{/if}
			</small>
		</p>
		<menu>
			<button type="button" onclick={share}>{copied ? t('list.linkCopied') : t('list.share')}</button>
			<a href="/lists/new?copy={encodeURIComponent(list.uri)}">{t('list.copy')}</a>
			{#if mine}
				<a href="{path}/edit">{t('list.edit')}</a>
				<button type="button" onclick={remove}>{t('list.delete')}</button>
			{:else if session.did}
				<button type="button" aria-expanded={suggesting} onclick={() => (suggesting = !suggesting)}>{t('suggestion.title')}</button>
			{:else if session.ready}
				<a href={signin}>{t('suggestion.title')}</a>
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
	button[aria-expanded='true'] {
		background: var(--color-soft);
	}
</style>
