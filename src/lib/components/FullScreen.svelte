<script>
	import { page } from '$app/state';
	import config from '#lib/data/config.json';

	/**
	 * A page given the whole screen, under the header and above the navigation (phones):
	 * a bar at the top, then what the page shows, which alone scrolls.
	 * view: how it is shown; a map takes the stage as it is, without scrolling.
	 * @type {{view?: string, bar: import('svelte').Snippet, children: import('svelte').Snippet}}
	 */
	let { view = '', bar, children } = $props();
	// Phones: no header above it (config.layout.bare), the bar goes to the top of the screen.
	const bare = $derived(config.layout.bare.includes(page.route.id || ''));
	// Every job, organization and list: one tap from each other (Explore).
</script>

<jl-full-screen {view} bare={bare || undefined}>
	<jl-full-screen-bar>{@render bar()}</jl-full-screen-bar>
	<jl-full-screen-stage>{@render children()}</jl-full-screen-stage>
</jl-full-screen>

<style>
	jl-full-screen {
		position: fixed;
		inset: var(--header-height) 0 calc(var(--nav-height) + env(safe-area-inset-bottom)) 0;
		z-index: 1;
		display: flex;
		flex-direction: column;
		background: var(--color-bg);
	}
	jl-full-screen-bar {
		flex: none;
		display: grid;
		gap: var(--space-s);
		padding: var(--space-s) var(--gutter);
		border-bottom: var(--border);
	}
	jl-full-screen-stage {
		position: relative;
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		overscroll-behavior: contain;
	}
	jl-full-screen[view='map'] jl-full-screen-stage {
		overflow: hidden;
	}
	@media not (min-width: 64rem) {
		jl-full-screen[bare] {
			top: 0;
		}
		jl-full-screen[bare] jl-full-screen-bar {
			padding-top: calc(env(safe-area-inset-top) + var(--space-s));
		}
	}
	/* Wide screens: no navigation at the bottom. */
	@media (min-width: 64rem) {
		jl-full-screen {
			bottom: 0;
		}
	}
</style>
