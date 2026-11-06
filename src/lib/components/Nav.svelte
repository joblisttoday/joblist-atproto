<script>
	import { page } from '$app/state';
	import { session } from '#lib/auth/session.svelte.js';
	import { navLinks } from '#lib/navigation/nav.js';
	import { t } from '#lib/i18n/index.svelte.js';

	const items = $derived(navLinks(session.handle));

	/** @param {string} href */
	function current(href) {
		const path = page.url.pathname;
		if (href === '/') return path === '/';
		return path === href || path.startsWith(`${href}/`);
	}
</script>

<jl-nav>
	<nav aria-label={t('nav.label')}>
		{#each items as item (item.href)}
			<a href={item.href} aria-current={current(item.href) ? 'page' : undefined} data-wide={item.wide || undefined}>{t(item.label)}</a>
		{/each}
	</nav>
</jl-nav>

<style>
	jl-nav {
		position: fixed;
		inset: auto 0 0 0;
		z-index: 10;
		background: var(--color-bg);
		border-top: var(--border);
		padding-bottom: env(safe-area-inset-bottom);
	}
	nav {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: 1fr;
	}
	a {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: var(--nav-height);
		padding: 0 var(--space-xs);
		font-size: var(--font-size-small);
		text-decoration: none;
		text-align: center;
		color: var(--color-muted);
		border-top: var(--border-width) solid transparent;
	}
	a:hover {
		color: var(--color-fg);
	}
	a[data-wide] {
		display: none;
	}
	a[aria-current='page'] {
		color: var(--color-fg);
		font-weight: var(--font-weight-strong);
		border-top-color: var(--color-fg);
	}

	@media (min-width: 48rem) {
		jl-nav {
			position: static;
			background: none;
			border: 0;
			padding: 0;
		}
		nav {
			display: flex;
			gap: var(--space-xs);
			margin: 0;
		}
		a,
		a[data-wide] {
			display: flex;
			min-height: var(--header-height);
			padding: 0 var(--space-s);
			font-size: var(--font-size);
			border-top: 0;
			border-bottom: var(--border-width) solid transparent;
		}
		a[aria-current='page'] {
			border-bottom-color: var(--color-fg);
		}
	}
</style>
