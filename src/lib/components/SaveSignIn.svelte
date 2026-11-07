<script>
	import DialogHeader from './DialogHeader.svelte';
	import SignIn from './SignIn.svelte';
	import { leftToSave } from '#lib/network/drafts.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Saving while signed out: says why signing in is needed, and starts it. What was written
	 * stays in this browser; signing in comes back to the form, ready to save.
	 * The form opens it with ask(). Kept outside the form: it holds its own (the handle).
	 * @type {{form: import('#lib/network/drafts.js').FormName}}
	 */
	let { form } = $props();
	const id = $props.id();
	/** @type {HTMLDialogElement | undefined} */
	let dialog = $state();

	export function ask() {
		if (!dialog) return;
		leftToSave(form);
		dialog.showModal();
	}
</script>

<jl-save-signin>
	<dialog bind:this={dialog} onclose={() => leftToSave(null)} aria-labelledby="{id}-title" aria-describedby="{id}-text">
		<DialogHeader id="{id}-title" title={t(`save.signin.${form}`)} />
		<p id="{id}-text">{t('save.signin.text')}</p>
		<SignIn />
		<form method="dialog">
			<menu><button value="later">{t('save.signin.later')}</button></menu>
		</form>
	</dialog>
</jl-save-signin>

<style>
	jl-save-signin {
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
	menu button {
		border-color: transparent;
	}
</style>
