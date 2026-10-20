<script>
	import { page } from '$app/state';
	import config from '#lib/data/config.json';
	import Nav from './Nav.svelte';
	import NetworkStatus from './NetworkStatus.svelte';
	import { session } from '#lib/auth/session.svelte.js';
	import { history } from '#lib/navigation/history.svelte.js';
	import { navLinks } from '#lib/navigation/nav.js';
	import { t } from '#lib/i18n/index.svelte.js';

	// The app name is always there; deeper pages also get a way back.
	const topLevel = $derived(
		[...navLinks(session.handle).map((l) => l.href), '/signin'].includes(page.url.pathname)
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
		<a href="/" aria-current={page.url.pathname === '/' ? 'page' : undefined}><b>{config.name}</b></a>
		{#if !topLevel}<a href="/" onclick={back}>← {t('nav.back')}</a>{/if}
		<Nav />
	</header>
	<NetworkStatus />
</jl-header>

<style>
	jl-header {
		display: block;
		border-bottom: var(--border);
	}
	header {
		display: flex;
		align-items: center;
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
	header > a + a {
		color: var(--color-muted);
		font-size: var(--font-size-small);
	}
	header > :global(jl-nav) {
		margin-left: auto;
	}

	@media (min-width: 48rem) {
		jl-header {
			position: sticky;
			top: 0;
			z-index: 10;
			background: var(--color-bg);
		}
	}
</style>
