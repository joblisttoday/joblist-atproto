<script>
	import Icon from './Icon.svelte';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Something to do over the page, without leaving it: a sheet from the bottom on phones,
	 * a panel in the middle on wide screens. A native dialog: Escape and the close button close it.
	 * @type {{open?: boolean, label: string, children: import('svelte').Snippet}}
	 */
	let { open = $bindable(false), label, children } = $props();
	/** @type {HTMLDialogElement} */
	let dialog;

	$effect(() => {
		if (open && !dialog.open) dialog.showModal();
		else if (!open && dialog.open) dialog.close();
	});
</script>

<jl-sheet>
	<dialog bind:this={dialog} aria-label={label} onclose={() => (open = false)}>
		<header>
			<h2>{label}</h2>
			<button type="button" onclick={() => (open = false)} aria-label={t('sheet.close')}><Icon name="close" /></button>
		</header>
		{#if open}{@render children()}{/if}
	</dialog>
</jl-sheet>

<style>
	dialog {
		width: 100%;
		max-width: none;
		max-height: var(--sheet-max);
		margin: auto 0 0;
		padding: 0 var(--gutter) calc(var(--space-m) + env(safe-area-inset-bottom));
		border: 0;
		border-radius: var(--radius-large) var(--radius-large) 0 0;
		background: var(--color-bg);
		color: var(--color-fg);
		box-shadow: var(--shadow);
		overflow-y: auto;
		overscroll-behavior: contain;
	}
	dialog::backdrop {
		background: var(--color-backdrop);
	}
	header {
		position: sticky;
		top: 0;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-s);
		padding: var(--space-s) 0;
		background: var(--color-bg);
	}
	h2 {
		margin: 0;
	}
	header > button {
		min-width: var(--tap-size);
		padding: 0;
		border: 0;
		border-radius: var(--radius-round);
	}
	@media (min-width: 48rem) {
		dialog {
			width: min(100% - 2 * var(--gutter), var(--reading-width));
			margin: auto;
			border-radius: var(--radius-large);
		}
	}
</style>
