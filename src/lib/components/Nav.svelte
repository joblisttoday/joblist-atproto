<script>
	import Icon from './Icon.svelte';
	import { page } from '$app/state';
	import { session } from '#lib/auth/session.svelte.js';
	import { navLinks } from '#lib/navigation/nav.js';
	import { savedJobs } from '#lib/network/saved-jobs.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	const items = $derived(navLinks(session.handle));
	/** The count a tab shows, 0 for none. @param {string | undefined} badge */
	const count = (badge) => (badge === 'saved' ? savedJobs.fresh : 0);

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
			{@const n = count(item.badge)}
			<a
				href={item.href}
				aria-current={current(item.href) ? 'page' : undefined}
				aria-label={n ? `${t(item.label)}, ${t('searches.new', { count: n })}` : undefined}
				data-wide={item.wide || undefined}
				><Icon name={item.icon} />{t(item.label)}{#if n}<mark>{n > 99 ? '99+' : n}</mark>{/if}</a
			>
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
	/* Phones: the icon above its label. */
	a {
		display: flex;
		flex-direction: column;
		gap: var(--space-xxs);
		--icon-size: var(--nav-icon-size);
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
	/* New jobs: a dot with the count, on the icon's corner. */
	a {
		position: relative;
	}
	mark {
		position: absolute;
		top: var(--space-xxs);
		left: calc(50% + var(--space-xs));
		min-width: var(--badge-size);
		padding: 0 var(--space-xxs);
		border-radius: var(--radius-round);
		background: var(--color-accent);
		color: var(--color-accent-fg);
		font-size: var(--font-size-badge);
		font-weight: var(--font-weight-strong);
		line-height: var(--badge-size);
		text-align: center;
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
		/* Wide screens: beside it. */
		a,
		a[data-wide] {
			display: flex;
			flex-direction: row;
			gap: var(--space-xs);
			--icon-size: 1em;
			min-height: var(--header-height);
			padding: 0 var(--space-s);
			font-size: var(--font-size);
			border-top: 0;
			border-bottom: var(--border-width) solid transparent;
		}
		a[aria-current='page'] {
			border-bottom-color: var(--color-fg);
		}
		mark {
			position: static;
		}
	}
</style>
