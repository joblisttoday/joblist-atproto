<script>
	import DialogHeader from './DialogHeader.svelte';
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
	const id = $props.id();
	/** @type {HTMLDialogElement | undefined} */
	let dialog = $state();
	let busy = $state(false);
	/** @type {string | null} */
	let error = $state(null);

	export function ask() {
		if (!dialog) return;
		dialog.returnValue = '';
		dialog.showModal();
	}

	async function onclose() {
		if (dialog?.returnValue !== 'delete' || !ownsList(list)) return;
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
	<dialog bind:this={dialog} {onclose} aria-labelledby="{id}-title" aria-describedby="{id}-text">
		<DialogHeader id="{id}-title" title={t(list.did === LOCAL ? 'list.delete.local.title' : 'list.delete.title', { name: list.name })} />
		<form method="dialog">
			<p id="{id}-text">{t(list.did === LOCAL ? 'list.delete.local.text' : 'list.delete.text', { count: list.companies.length })}</p>
			<menu>
				<button value="keep">{t('list.delete.keep')}</button>
				<button value="delete">{t('list.delete.confirm')}</button>
			</menu>
		</form>
	</dialog>
	{#if busy}<p aria-live="polite"><small>{t('list.deleting')}</small></p>{/if}
	{#if error}<p role="alert">{error}</p>{/if}
</jl-list-delete>

<style>
	jl-list-delete {
		display: contents;
	}
	dialog {
		width: min(100% - 2 * var(--gutter), var(--measure));
		--dialog-padding: var(--space-l);
		padding: 0 var(--dialog-padding) var(--space-m);
		border: var(--border);
		border-radius: var(--radius-large);
		background: var(--color-bg);
		color: var(--color-fg);
	}
	dialog::backdrop {
		background: var(--backdrop);
	}
	menu {
		justify-content: flex-end;
		margin-bottom: 0;
	}
	button[value='delete'] {
		color: var(--color-error);
		border-color: var(--color-error);
	}
	p {
		margin: var(--space-xs) 0 0;
	}
</style>
