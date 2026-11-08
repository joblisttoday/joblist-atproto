<script>
	import DialogHeader from './DialogHeader.svelte';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Before something that cannot be undone: what it does, in a native dialog,
	 * keeping it the default (Escape, Close and a tap beside it keep it too).
	 * The page opens it with ask(); onconfirm runs only on the confirm button.
	 * @type {{title: string, text?: string, confirm: string, keep?: string, onconfirm: () => void}}
	 */
	let { title, text = '', confirm, keep = t('confirm.keep'), onconfirm } = $props();
	const id = $props.id();
	/** @type {HTMLDialogElement | undefined} */
	let dialog = $state();

	export function ask() {
		if (!dialog) return;
		dialog.returnValue = '';
		dialog.showModal();
	}
</script>

<dialog bind:this={dialog} onclose={() => dialog?.returnValue === 'confirm' && onconfirm()} aria-labelledby="{id}-title" aria-describedby={text ? `${id}-text` : undefined}>
	<DialogHeader id="{id}-title" {title} />
	<form method="dialog">
		{#if text}<p id="{id}-text">{text}</p>{/if}
		<menu>
			<button value="keep">{keep}</button>
			<button value="confirm">{confirm}</button>
		</menu>
	</form>
</dialog>

<style>
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
	button[value='confirm'] {
		color: var(--color-error);
		border-color: var(--color-error);
	}
	p {
		margin: var(--space-xs) 0 0;
	}
</style>
