<script>
	import { session } from '#lib/auth/session.svelte.js';
	import { backToSave } from '#lib/network/drafts.js';
	import { t } from '#lib/i18n/index.svelte.js';
	import { untrack } from 'svelte';

	/**
	 * Back on the form after signing in to save it: it is as it was left, and one tap saves it.
	 * Inside the form: its button is the form's own submit, so the form checks it as usual.
	 * @type {{form: import('#lib/network/drafts.js').FormName, label: string}} label: the save button's
	 */
	let { form, label } = $props();
	// Read once, as the form opens.
	const back = untrack(() => backToSave(form));
</script>

{#if back && session.did}
	<jl-save-resumed role="status">
		<p>{t('save.resumed', { handle: session.handle || '' })}</p>
		<button type="submit">{label}</button>
	</jl-save-resumed>
{/if}

<style>
	jl-save-resumed {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-s);
		margin: var(--space-s) 0;
		padding: var(--space-s) var(--space-m);
		border-radius: var(--radius);
		background: var(--color-soft);
	}
	p {
		margin: 0;
	}
	button {
		background: var(--color-accent);
		color: var(--color-accent-fg);
		border-color: var(--color-accent);
	}
</style>
