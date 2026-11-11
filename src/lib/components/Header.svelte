<script>
	import Logo from './Logo.svelte';
	import QuickSearch from './QuickSearch.svelte';
	import ExploreSwitch from './ExploreSwitch.svelte';
	import { page } from '$app/state';
	import config from '#lib/data/config.json';
	import Nav from './Nav.svelte';
	import NetworkStatus from './NetworkStatus.svelte';

	// The app name is always there; the way back is the browser's.
	// Phones: these pages take the whole screen, their own bar at the top (config.layout.bare).
	const bare = $derived(config.layout.bare.includes(page.route.id || ''));
	// Jobs, organizations: each has its own search, so the header has the way between them.
	const explore = $derived(config.layout.explore.includes(page.route.id || ''));
	// The home and Me show the search in the page: not a second one here.
	const inPage = $derived(config.layout.searchInPage.includes(page.route.id || ''));
</script>

<jl-header bare={bare || undefined}>
	<header>
		<a href="/" aria-current={page.url.pathname === '/' ? 'page' : undefined}><Logo /><b>{config.name}</b></a>
		<!-- The home and the explore pages have their own search. -->
		{#if explore}<ExploreSwitch />{:else if inPage}<jl-header-space></jl-header-space>{:else}<QuickSearch />{/if}
		<Nav />
	</header>
	<NetworkStatus />
</jl-header>

<style>
	/* The room the search takes elsewhere: the navigation stays at the end. */
	jl-header-space {
		flex: 1;
	}
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
	header > :global(jl-nav) {
		margin-left: auto;
	}
	@media not (min-width: 64rem) {
		header > :global(jl-locale-switch) {
			display: none;
		}
	}
</style>
