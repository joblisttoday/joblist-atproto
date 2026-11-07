<script>
	import DialogHeader from './DialogHeader.svelte';

	/**
	 * Something to do over the page, without leaving it: a sheet from the bottom on phones,
	 * a panel in the middle on wide screens. A native dialog: Escape and the close button close it.
	 * @type {{open?: boolean, label: string, children: import('svelte').Snippet}}
	 */
	let { open = $bindable(false), label, children } = $props();
	const id = $props.id();
	/** @type {HTMLDialogElement} */
	let dialog;

	$effect(() => {
		if (open && !dialog.open) dialog.showModal();
		else if (!open && dialog.open) dialog.close();
	});
</script>

<jl-sheet>
	<dialog bind:this={dialog} aria-labelledby="{id}-title" onclose={() => (open = false)}>
		<DialogHeader id="{id}-title" title={label} />
		{#if open}{@render children()}{/if}
	</dialog>
</jl-sheet>

<style>
	dialog {
		width: 100%;
		max-width: none;
		max-height: var(--sheet-max);
		margin: auto 0 0;
		--dialog-padding: var(--gutter);
		padding: 0 var(--dialog-padding) calc(var(--space-m) + env(safe-area-inset-bottom));
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
	@media (min-width: 48rem) {
		dialog {
			width: min(100% - 2 * var(--gutter), var(--reading-width));
			margin: auto;
			border-radius: var(--radius-large);
		}
	}
</style>
