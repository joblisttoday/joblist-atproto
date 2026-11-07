<script>
	import Icon from './Icon.svelte';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * The top of every dialog, kept in sight while it scrolls: its title (which names it:
	 * the dialog has aria-labelledby={id}), what it is about, and Close on the right.
	 * Close is a native dialog form: it closes without any script, like Escape.
	 * height: how tall it is (a title can take two lines), for what sticks under it.
	 * @type {{id: string, title: string, about?: import('svelte').Snippet, height?: number}}
	 */
	let { id, title, about, height = $bindable(0) } = $props();
</script>

<jl-dialog-header bind:clientHeight={height}>
	<hgroup>
		<h2 {id}>{title}</h2>
		{#if about}<p>{@render about()}</p>{/if}
	</hgroup>
	<form method="dialog">
		<button value="close"><Icon name="close" /> {t('dialog.close')}</button>
	</form>
</jl-dialog-header>

<style>
	/* The dialog sets --dialog-padding, its side room: the header spans it. */
	jl-dialog-header {
		position: sticky;
		top: 0;
		z-index: 2;
		display: flex;
		align-items: center;
		gap: var(--space-s);
		min-height: var(--dialog-bar-height);
		margin-inline: calc(-1 * var(--dialog-padding));
		margin-bottom: var(--space-s);
		padding: var(--space-xs) var(--dialog-padding);
		background: var(--color-bg);
		border-bottom: var(--border);
	}
	hgroup {
		flex: 1;
		min-width: 0;
	}
	h2 {
		margin: 0;
		font-size: var(--font-size);
		line-height: var(--line-height-tight);
	}
	p {
		margin: 0;
		color: var(--color-muted);
		font-size: var(--font-size-small);
	}
	form {
		flex: none;
	}
	button {
		min-height: var(--chip-height);
		padding: 0 var(--space-m);
		border-radius: var(--radius-round);
		font-size: var(--font-size-small);
	}
</style>
