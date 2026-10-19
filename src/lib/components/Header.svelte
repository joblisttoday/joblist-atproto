<script>
	import { page } from '$app/state';
	import config from '#lib/data/config.json';
	import links from '#lib/data/nav.json';
	import Nav from './Nav.svelte';
	import { history } from '#lib/navigation/history.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	// Top-level pages show the app name; deeper pages show a way back.
	const topLevel = $derived(
		[...links.map((l) => l.href), '/signin'].includes(page.url.pathname)
	);

	/** @param {MouseEvent} event */
	function back(event) {
		if (!history.inApp) return;
		event.preventDefault();
		window.history.back();
	}
</script>

<jl-header>
	<header>
		{#if topLevel}
			<a href="/" aria-current={page.url.pathname === '/' ? 'page' : undefined}><b>{config.name}</b></a>
		{:else}
			<a href="/" onclick={back}>← {t('nav.back')}</a>
		{/if}
		<Nav />
	</header>
</jl-header>

<style>
	jl-header {
		display: block;
		border-bottom: var(--border);
	}
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-m);
		max-width: var(--page-width);
		min-height: var(--header-height);
		margin: 0 auto;
		padding: 0 var(--space-m);
	}
	header > a {
		display: flex;
		align-items: center;
		min-height: var(--tap-size);
		text-decoration: none;
	}

	@media (min-width: 48rem) {
		jl-header {
			position: sticky;
			top: 0;
			z-index: 10;
			background: var(--color-overlay);
		}
		header {
			max-width: var(--wide-width);
		}
	}
</style>
