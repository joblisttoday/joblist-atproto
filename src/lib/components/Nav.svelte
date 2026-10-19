<script>
	import { page } from '$app/state';
	import { session } from '#lib/auth/session.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	const links = $derived([
		{ href: '/', label: t('nav.lists') },
		{ href: '/companies', label: t('nav.companies') },
		{ href: session.did ? '/add' : '/signin', label: t('nav.add') },
		{ href: session.did ? '/me' : '/signin', label: session.did ? t('nav.me') : t('nav.signin') }
	]);

	/** @param {string} href */
	function current(href) {
		const path = page.url.pathname;
		return href === '/' ? path === '/' : path.startsWith(href);
	}
</script>

<jl-nav>
	<nav>
		{#each links as link (link.label)}
			<a href={link.href} aria-current={current(link.href) ? 'page' : undefined}>{link.label}</a>
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
		grid-template-columns: repeat(4, 1fr);
		max-width: var(--page-width);
		margin: 0 auto;
	}
	a {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: var(--nav-height);
		text-decoration: none;
		color: var(--color-muted);
	}
	a[aria-current='page'] {
		color: var(--color-fg);
		font-weight: 600;
	}
</style>
