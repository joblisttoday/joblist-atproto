<script>
	import Icon from './Icon.svelte';
	import { page } from '$app/state';
	import { bookmarklet } from '#lib/tools/bookmarklet.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Open joblist on the page you are on: the share button of the installed app (the share
	 * target), or the bookmarklet. Each opens the organization's page, to save it.
	 */
	const code = $derived(bookmarklet(page.url.origin));
	let dragHint = $state(false);

	/** @param {MouseEvent} event */
	function click(event) {
		// Clicked here it would open this page: it is meant to be dragged to the bookmarks.
		event.preventDefault();
		dragHint = true;
	}
</script>

<jl-add-anywhere hinted={dragHint || undefined}>
	<h2>{t('anywhere.share.title')}</h2>
	<p>{t('anywhere.share.text')}</p>

	<h2>{t('anywhere.bookmarklet.title')}</h2>
	<p>{t('anywhere.bookmarklet.text')}</p>
	<menu><a href={code} onclick={click} draggable="true"><Icon name="add" /> {t('anywhere.bookmarklet.link')}</a></menu>
	<p><small role={dragHint ? 'status' : undefined}>{t('anywhere.bookmarklet.help')}</small></p>
</jl-add-anywhere>

<style>
	jl-add-anywhere {
		display: block;
		margin-top: var(--space-l);
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
</style>
