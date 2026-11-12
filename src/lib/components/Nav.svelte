<script>
	import Icon from './Icon.svelte';
	import { page } from '$app/state';
	import { session } from '#lib/auth/session.svelte.js';
	import { navLinks } from '#lib/navigation/nav.js';
	import { savedJobs } from '#lib/network/saved-jobs.svelte.js';
	import { data } from '#lib/network/network.svelte.js';
	import { ownDomain } from '#lib/models/company.js';
	import { t } from '#lib/i18n/index.svelte.js';

	const all = navLinks();
	const own = $derived(ownDomain(session.handle));
	// An organization's tab only for its account.
	// Two areas, by role (docs/architecture.md): the job seeker's (nav.json: Explore, Jobs,
	// Saved, Menu) and, signed in with its domain, the organization's in /org (its home with
	// the organization's icon, Post a job, its page as visitors see it with its logo and
	// @domain, Menu). The address says which.
	const menu = all.filter((i) => i.href === '/menu');
	// The Menu is both areas': an organization keeps its tabs there; Browse jobs (/jobs) is the seeker's.
	const path = $derived(page.url.pathname);
	const inOrg = $derived(Boolean(own) && (path === '/org' || path.startsWith('/org/') || path === `/${own}` || path === '/menu' || path.startsWith('/menu/')));
	/** @type {{href: string, label: string, raw?: string, icon: import('#lib/icons.js').IconName, badge?: string, account?: boolean, within: string[]}[]} */
	const items = $derived(
		inOrg
			? [
					{ href: '/org', label: 'nav.org', icon: /** @type {const} */ ('companies'), within: ['/org/page', '/org/embed', '/org/jobs'] },
					{ href: '/org/post', label: 'post.title', icon: /** @type {const} */ ('add'), within: [] },
					// Its page, as visitors see it: its logo and its handle.
					{ href: `/${own}`, label: '', raw: `@${own}`, icon: /** @type {const} */ ('companies'), account: true, within: [] },
					...menu
				]
			: all
	);
	/** The count a tab shows, 0 for none. @param {string | undefined} badge */
	const count = (badge) => (badge === 'saved' ? savedJobs.fresh : 0);
	// Signed in with a company's domain: the account is that company's.
	const company = $derived(session.handle ? data.companies.get(session.handle) : undefined);
	/** What the menu tab says to screen readers, signed in. */
	const accountLabel = $derived(
		company ? t('nav.me.company', { handle: session.handle || '', name: company.name }) : t('nav.me.account', { handle: session.handle || '' })
	);

	/** A tab's words: its own (an organization's @domain), else translated. @param {{label: string, raw?: string}} item */
	const labelOf = (item) => item.raw || t(item.label);

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
			<a
				href={item.href}
				aria-current={current(item) ? 'page' : undefined}
				aria-label={item.account && session.handle ? `${accountLabel}${n ? `, ${t('searches.new', { count: n })}` : ''}` : n ? `${t(item.label)}, ${t('searches.new', { count: n })}` : undefined}
				data-account={item.account && session.handle ? (company ? 'company' : 'person') : undefined}
			>
				<!-- The menu: signed in, the account's picture in place of its icon. -->
				{#if item.account && session.handle}
					{#if session.avatar}<img src={session.avatar} alt="" />{:else}<Icon name={item.icon} />{/if}
					<span>{labelOf(item)}</span>
					{#if company && !item.raw}<Icon name="companies" />{/if}{#if n}<mark>{n > 99 ? '99+' : n}</mark>{/if}
				{:else}
					<Icon name={item.icon} />{labelOf(item)}{#if n}<mark>{n > 99 ? '99+' : n}</mark>{/if}
				{/if}
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
	/* Signed in, the menu shows the account's picture; a company account says so. */
	a[data-account] img {
		width: var(--nav-icon-size);
		height: var(--nav-icon-size);
		border-radius: var(--radius-round);
		object-fit: cover;
	}
	a[data-account] span {
		max-width: 100%;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	a[data-account='company'] > :global(jl-icon:last-child) {
		position: absolute;
		top: var(--space-xxs);
		left: calc(50% + var(--space-xs));
		color: var(--color-ok);
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
