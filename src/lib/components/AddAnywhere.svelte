<script>
	import Icon from './Icon.svelte';
	import { page } from '$app/state';
	import { bookmarklet } from '#lib/tools/bookmarklet.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Ways to send a company to joblist from the page it is on: share target, bookmarklet, AI assistants.
	 * open: unfolded (on /apps).
	 * @type {{open?: boolean}}
	 */
	let { open = false } = $props();
	const code = $derived(bookmarklet(page.url.origin));
	let dragHint = $state(false);

	/** @param {MouseEvent} event */
	function click(event) {
		// Clicked here it would add this page: it is meant to be dragged to the bookmarks.
		event.preventDefault();
		dragHint = true;
	}
</script>

<jl-add-anywhere hinted={dragHint || undefined}>
	<details {open}>
		<summary>{t('anywhere.title')}</summary>
		<p>{t('anywhere.intro')}</p>

		<h3>{t('anywhere.share.title')}</h3>
		<p>{t('anywhere.share.text')}</p>

		<h3>{t('anywhere.bookmarklet.title')}</h3>
		<p>{t('anywhere.bookmarklet.text')}</p>
		<menu><a href={code} onclick={click} draggable="true"><Icon name="add" /> {t('anywhere.bookmarklet.link')}</a></menu>
		<p><small role={dragHint ? 'status' : undefined}>{t('anywhere.bookmarklet.help')}</small></p>
		<label for="bookmarklet-code">{t('anywhere.bookmarklet.code')}</label>
		<textarea id="bookmarklet-code" readonly rows="4" aria-describedby="bookmarklet-code-help" onfocus={(e) => e.currentTarget.select()}>{code}</textarea>
		<small id="bookmarklet-code-help">{t('anywhere.bookmarklet.code.help')}</small>

		<h3>{t('anywhere.agents.title')}</h3>
		<p>{t('anywhere.agents.text')}</p>
	</details>
</jl-add-anywhere>

<style>
	jl-add-anywhere {
		display: block;
		margin-top: var(--space-xl);
		border-top: var(--border);
	}
	details[open] {
		padding-bottom: var(--space-m);
	}
	menu a {
		cursor: grab;
		background: var(--color-accent);
		color: var(--color-accent-fg);
		border-color: var(--color-accent);
	}
	menu {
		margin-bottom: var(--space-xs);
	}
	jl-add-anywhere[hinted] [role='status'] {
		color: var(--color-fg);
	}
	label {
		font-weight: normal;
		font-size: var(--font-size-small);
	}
	textarea {
		font-family: monospace;
	}
</style>
