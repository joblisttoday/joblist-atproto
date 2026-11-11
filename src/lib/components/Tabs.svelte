<script>
	import Icon from './Icon.svelte';
	import { page } from '$app/state';
	import { formatNumber } from '#lib/i18n/index.svelte.js';

	/**
	 * A page's tabs, each its own address under the page's (/{handle}/jobs, /{domain}/places),
	 * with how many things it holds. Phones: the whole width, kept in sight under the header.
	 * @type {{base: string, label: string, tabs: {path: string, icon: import('#lib/icons.js').IconName, label: string, count?: number}[]}}
	 *   base: the page's address; a tab's path is added to it ('' for the first)
	 */
	let { base, label, tabs } = $props();
</script>

<jl-tabs>
	<nav aria-label={label}>
		{#each tabs as tab (tab.path)}
			{@const href = `${base}${tab.path}`}
			<a {href} aria-current={page.url.pathname === href ? 'page' : undefined}>
				<Icon name={tab.icon} />
				<span>{tab.label}</span>
				{#if tab.count !== undefined}<small>{formatNumber(tab.count)}</small>{/if}
			</a>
		{/each}
	</nav>
</jl-tabs>

<style>
	/* Phones: edge to edge, under the sticky header; wide screens: tabs under the profile. */
	jl-tabs {
		display: block;
		position: sticky;
		top: var(--header-height);
		z-index: 2;
		margin: 0 calc(-1 * var(--gutter)) var(--space-s);
		background: var(--color-bg);
		border-bottom: var(--border);
	}
	/* Each tab as wide as its words, the room left shared between them. */
	nav {
		display: flex;
		padding: 0 var(--gutter);
		overflow-x: auto;
		scrollbar-width: none;
	}
	nav > a {
		flex: 1 0 auto;
	}
	a {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-xs);
		min-width: 0;
		min-height: var(--tap-size);
		padding: 0 var(--space-xs);
		color: var(--color-muted);
		font-size: var(--font-size-small);
		text-decoration: none;
		border-bottom: var(--selected-bar) solid transparent;
	}
	span {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	a[aria-current='page'] {
		color: var(--color-fg);
		font-weight: var(--font-weight-strong);
		border-bottom-color: var(--color-fg);
	}
	/* Phones: the words alone, so they fit. */
	@media not (min-width: 64rem) {
		a > :global(jl-icon) {
			display: none;
		}
	}
	@media (min-width: 64rem) {
		nav {
			gap: var(--space-m);
		}
		nav > a {
			flex: none;
		}
		a {
			justify-content: flex-start;
			font-size: var(--font-size);
		}
	}
</style>
