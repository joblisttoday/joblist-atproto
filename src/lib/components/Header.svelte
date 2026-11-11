<script>
	import Icon from './Icon.svelte';
	import Logo from './Logo.svelte';
	import QuickSearch from './QuickSearch.svelte';
	import ExploreSwitch from './ExploreSwitch.svelte';
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
		[...navLinks().map((l) => l.href), '/companies', '/lists', '/signin'].includes(page.url.pathname)
	);

	// Phones: these pages take the whole screen, their own bar at the top (config.layout.bare).
	const bare = $derived(config.layout.bare.includes(page.route.id || ''));
	// Jobs, organizations, lists: each has its own search, so the header has the way between them.
	const explore = $derived(config.layout.explore.includes(page.route.id || ''));

	/** @param {MouseEvent} event */
	function back(event) {
		if (!history.inApp) return;
		event.preventDefault();
		window.history.back();
	}
</script>

<jl-header bare={bare || undefined}>
	<header>
		<a href="/" aria-current={page.url.pathname === '/' ? 'page' : undefined}><Logo /><b>{config.name}</b></a>
		{#if !topLevel}<a href="/" onclick={back}><Icon name="back" /> {t('nav.back')}</a>{/if}
		<!-- The home and the explore pages have their own search. -->
		{#if explore}<ExploreSwitch />{:else}<QuickSearch />{/if}
		<Nav />
	</header>
	<NetworkStatus />
</jl-header>

<style>
	/* Phones: pages using the whole screen keep only the navigation (fixed at the bottom). */
	@media not (min-width: 64rem) {
		jl-header[bare] {
			border: 0;
		}
		jl-header[bare] header {
			min-height: 0;
			padding: 0;
		}
		jl-header[bare] header > a,
		jl-header[bare] header > :global(jl-search),
		jl-header[bare] > :global(jl-network-status) {
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
