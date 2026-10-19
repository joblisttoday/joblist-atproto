<script>
	import config from '#lib/data/config.json';
	import { page } from '$app/state';
	import { bookmarklet } from '#lib/tools/bookmarklet.js';
	import { t } from '#lib/i18n/index.svelte.js';

	const code = $derived(bookmarklet(page.url.origin));
	let dragHint = $state(false);

	/** @param {MouseEvent} event */
	function click(event) {
		// Clicked here it would add this page: it is meant to be dragged to the bookmarks.
		event.preventDefault();
		dragHint = true;
	}
</script>

<svelte:head><title>{t('tools.title')} · {config.name}</title></svelte:head>

<h1>{t('tools.title')}</h1>
<p>{t('tools.intro')}</p>

<section>
	<h2>{t('tools.share.title')}</h2>
	<p>{t('tools.share.text')}</p>
</section>

<section>
	<h2>{t('tools.bookmarklet.title')}</h2>
	<p>{t('tools.bookmarklet.text')}</p>
	<jl-bookmarklet hinted={dragHint || undefined}>
		<menu><a href={code} onclick={click} draggable="true">+ {t('tools.bookmarklet.link')}</a></menu>
		<small role={dragHint ? 'status' : undefined}>{t('tools.bookmarklet.help')}</small>
	</jl-bookmarklet>
	<details>
		<summary>{t('tools.bookmarklet.code')}</summary>
		<p><small>{t('tools.bookmarklet.code.help')}</small></p>
		<textarea readonly rows="6" aria-label={t('tools.bookmarklet.code')} onfocus={(e) => e.currentTarget.select()}>{code}</textarea>
	</details>
</section>

<section>
	<h2>{t('tools.agents.title')}</h2>
	<p>{t('tools.agents.text')}</p>
</section>

<menu><a href="/add">+ {t('form.company.title')}</a></menu>

<style>
	jl-bookmarklet {
		display: block;
	}
	jl-bookmarklet a {
		cursor: grab;
		background: var(--color-accent);
		color: var(--color-accent-fg);
		border-color: var(--color-accent);
	}
	jl-bookmarklet[hinted] small {
		color: var(--color-fg);
	}
	textarea {
		font-family: monospace;
		font-size: var(--font-size-small);
	}
</style>
