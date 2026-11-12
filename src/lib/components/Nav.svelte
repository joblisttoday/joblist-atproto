<script>
	import Icon from './Icon.svelte';
	import { page } from '$app/state';
	import { navLinks } from '#lib/navigation/nav.js';
	import { exploreTab } from '#lib/navigation/explore-tab.svelte.js';
	import { savedJobs } from '#lib/network/saved-jobs.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	// The same three tabs for everyone (nav.json: Home, Explore, Menu); Explore opens the part
	// last used, Organizations or Jobs (explore-tab.svelte.js; docs/architecture.md).
	const items = navLinks();
	/** Where a tab goes. @param {{href: string}} item */
	const hrefOf = (item) => (item.href === '/jobs' ? exploreTab.href : item.href);
	/** The count a tab shows, 0 for none. @param {string | undefined} badge */
	const count = (badge) => (badge === 'saved' ? savedJobs.fresh : 0);

	/** The tab of the page shown: its own path, or one it is the tab of (nav.json "within"). @param {{href: string, within: string[]}} item */
	function current({ href, within }) {
		const path = page.url.pathname;
		const under = (/** @type {string} */ p) => path === p || path.startsWith(`${p}/`);
		if (href === '/') return path === '/' || within.some(under);
		// When two tabs claim a path, the more precise one wins.
		const mine = [href, ...within].filter(under).reduce((a, b) => Math.max(a, b.length), 0);
		const others = items.filter((i) => i.href !== href).flatMap((i) => [i.href, ...i.within].filter((p) => p !== '/' && under(p)));
		return mine > 0 && others.every((p) => p.length < mine);
	}
</script>

<jl-nav>
	<nav aria-label={t('nav.label')}>
		{#each items as item (item.href)}
			{@const n = count(item.badge)}
			<a href={hrefOf(item)} aria-current={current(item) ? 'page' : undefined} aria-label={n ? `${t(item.label)}, ${t('searches.new', { count: n })}` : undefined}>
				<Icon name={item.icon} />{t(item.label)}{#if n}<mark>{n > 99 ? '99+' : n}</mark>{/if}
			</a>
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
	a[aria-current='page'] {
		color: var(--color-fg);
		font-weight: var(--font-weight-strong);
		border-top-color: var(--color-fg);
	}

	/* Wide screens too: at the bottom, as wide as reading, centered (mobile first). */
	@media (min-width: 64rem) {
		nav {
			max-width: var(--reading-width);
			margin-inline: auto;
		}
	}
</style>
