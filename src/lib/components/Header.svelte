<script>
	import { kept } from '#lib/network/kept.svelte.js';
	import Logo from './Logo.svelte';
	import { page } from '$app/state';
	import config from '#lib/data/config.json';
	import Nav from './Nav.svelte';

	// The app name is always there; the way back is the browser's.
	// Phones: these pages take the whole screen, their own bar at the top (config.layout.bare).
	// The home is the jobs only once organizations are followed (before, a start page).
	const bare = $derived(config.layout.bare.includes(page.route.id || '') && (page.route.id !== '/' || kept.list.length > 0));
</script>

<jl-header bare={bare || undefined}>
	<header>
		<a href="/" aria-current={page.url.pathname === '/' ? 'page' : undefined}><Logo /><b>{config.name}</b></a>
		<jl-header-space></jl-header-space>
		<Nav />
	</header>
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
