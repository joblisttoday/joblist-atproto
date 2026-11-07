<script>
	import DialogHeader from './DialogHeader.svelte';
	import { goto } from '$app/navigation';
	import config from '#lib/data/config.json';
	import { deleteRecord } from '#lib/atproto/write.js';
	import { session } from '#lib/auth/session.svelte.js';
	import { afterDelete } from '#lib/models/company-form.js';
	import { data, handleOf, removeLocal } from '#lib/network/network.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Delete the signed-in person's version of a company, once they have read
	 * what it does to the page (a native dialog, "Keep it" by default).
	 * @type {{company: import('#lib/models/company.js').Company}}
	 */
	let { company } = $props();
	const id = $props.id();
	const own = $derived(company.versions.find((v) => v.did === session.did));
	const after = $derived(afterDelete(company, session.did || '', data.profiles));
	const handle = $derived('next' in after ? handleOf(after.next.did) : '');
	/** @type {HTMLDialogElement | undefined} */
	let dialog = $state();
	let busy = $state(false);
	/** @type {string | null} */
	let error = $state(null);

	function open() {
		if (!dialog) return;
		dialog.returnValue = '';
		dialog.showModal();
	}

	async function onclose() {
		if (dialog?.returnValue !== 'delete' || !own) return;
		// Said before deleting: once deleted, what remains is another page.
		const { outcome } = after;
		busy = true;
		error = null;
		try {
			await deleteRecord(config.collections.company, company.key);
			removeLocal('company', own.uri);
			if (outcome === 'gone') await goto('/companies');
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
		} finally {
			busy = false;
		}
	}
</script>

{#if own}
	<jl-company-delete>
		<button type="button" onclick={open} disabled={busy}>
			{busy ? t('company.deleting') : t('company.delete')}
		</button>
		<dialog bind:this={dialog} {onclose} aria-labelledby="{id}-title" aria-describedby="{id}-text">
			<DialogHeader id="{id}-title" title={t(`company.delete.${after.outcome}`, { name: company.name, handle })} />
			<form method="dialog">
				<p id="{id}-text">{t(`company.delete.${after.outcome}.text`, { name: company.name })}</p>
				<menu>
					<button value="keep">{t('company.delete.keep')}</button>
					<button value="delete">{t('company.delete.confirm')}</button>
				</menu>
			</form>
		</dialog>
		{#if error}<p role="alert">{error}</p>{/if}
	</jl-company-delete>
{/if}

<style>
	jl-company-delete {
		display: contents;
	}
	/* Beside the page's other actions, as small as they are. */
	jl-company-delete > button {
		font-size: var(--font-size-small);
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
</style>
