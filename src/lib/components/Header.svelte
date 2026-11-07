<script>
	import Icon from './Icon.svelte';
	import LocaleSwitch from './LocaleSwitch.svelte';
	import Logo from './Logo.svelte';
	import QuickSearch from './QuickSearch.svelte';
	import { page } from '$app/state';
	import config from '#lib/data/config.json';
	import Nav from './Nav.svelte';
	import NetworkStatus from './NetworkStatus.svelte';
	import { session } from '#lib/auth/session.svelte.js';
	import { history } from '#lib/navigation/history.svelte.js';
	import { navLinks } from '#lib/navigation/nav.js';
	import { t } from '#lib/i18n/index.svelte.js';

	// The app name is always there; deeper pages also get a way back
	// (and the pages only wide screens have a tab for, such as posting a job: a form, left with Back).
	const topLevel = $derived(
		[...navLinks(session.handle).filter((l) => !l.wide).map((l) => l.href), '/signin'].includes(page.url.pathname)
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
		<a href="/" aria-current={page.url.pathname === '/' ? 'page' : undefined}><Logo /><b>{config.name}</b></a>
		{#if !topLevel}<a href="/" onclick={back}><Icon name="back" /> {t('nav.back')}</a>{/if}
		<!-- The explorer has its own search. -->
		{#if page.url.pathname !== '/'}<QuickSearch />{/if}
		<Nav />
		<!-- Wide screens; phones have it in the account tab (signing in, one's page) and the footer. -->
		<LocaleSwitch compact />
	</header>
	<NetworkStatus />
</jl-header>

<style>
	/* Phones: pages using the whole screen (the explorer) keep only the navigation. */
	@media not (min-width: 64rem) {
		:global(body:has(jl-explore)) jl-header {
			border: 0;
		}
		:global(body:has(jl-explore)) header {
			min-height: 0;
			padding: 0;
		}
		:global(body:has(jl-explore)) header > a,
		:global(body:has(jl-explore)) jl-header > :global(jl-network-status) {
			display: none;
		}
	}
	jl-header {
		display: block;
		position: sticky;
		top: 0;
		z-index: 10;
		background: var(--color-bg);
		border-bottom: var(--border);
	}
	header {
		display: flex;
		align-items: center;
		gap: var(--space-m);
		min-height: var(--header-height);
		padding: 0 var(--gutter);
	}
	header > a {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
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
	@media not (min-width: 64rem) {
		header > :global(jl-locale-switch) {
			display: none;
		}
	}
</style>
