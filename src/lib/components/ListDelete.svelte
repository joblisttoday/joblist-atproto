<script>
	import ConfirmDialog from './ConfirmDialog.svelte';
	import { goto } from '$app/navigation';
	import { session } from '#lib/auth/session.svelte.js';
	import { deleteList } from '#lib/network/save-list.js';
	import { ownsList } from '#lib/network/network.svelte.js';
	import { LOCAL } from '#lib/models/list.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Delete one of the signed-in person's lists, once they have read what it does
	 * (a native dialog, "Keep it" by default). The page opens it with ask().
	 * @type {{list: import('#lib/models/list.js').List}}
	 */
	let { list } = $props();
	/** @type {ConfirmDialog | undefined} */
	let confirmer = $state();
	let busy = $state(false);
	/** @type {string | null} */
	let error = $state(null);

	export function ask() {
		confirmer?.ask();
	}

	async function remove() {
		if (!ownsList(list)) return;
		busy = true;
		error = null;
		try {
			await deleteList(list);
			await goto(list.did === LOCAL ? '/lists' : `/${session.handle}`);
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
		} finally {
			busy = false;
		}
	}
</script>

<jl-list-delete busy={busy || undefined}>
	<ConfirmDialog
		bind:this={confirmer}
		title={t(list.did === LOCAL ? 'list.delete.local.title' : 'list.delete.title', { name: list.name })}
		text={t(list.did === LOCAL ? 'list.delete.local.text' : 'list.delete.text', { count: list.companies.length })}
		keep={t('list.delete.keep')}
		confirm={t('list.delete.confirm')}
		onconfirm={remove}
	/>
	{#if busy}<p aria-live="polite"><small>{t('list.deleting')}</small></p>{/if}
	{#if error}<p role="alert">{error}</p>{/if}
</jl-list-delete>

<style>
	jl-list-delete {
		display: contents;
	}
	p {
		margin: var(--space-xs) 0 0;
	}
</style>
