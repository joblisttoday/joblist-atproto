<script>
	import { goto } from '$app/navigation';
	import config from '#lib/data/config.json';
	import Icon from '#lib/components/Icon.svelte';
	import MenuLinks from '#lib/components/MenuLinks.svelte';
	import { session, signOut, switchAccount } from '#lib/auth/session.svelte.js';
	import { accounts } from '#lib/auth/accounts.js';
	import { outbox } from '#lib/network/outbox.svelte.js';
	import { own } from '#lib/network/own-lists.svelte.js';
	import { searches } from '#lib/network/saved-searches.svelte.js';
	import { formatNumber, i18n, t } from '#lib/i18n/index.svelte.js';

	/**
	 * The menu: what this browser keeps (searches, lists of jobs; organizations are on the
	 * home), your account, and how joblist works here, each a row leading to its own page.
	 */
	const waiting = $derived(outbox.entries.filter((e) => e.did === session.did).length);

	async function out() {
		await signOut();
		await goto('/');
	}

	/** @type {import('#lib/navigation/nav.js').MenuLink[]} */
	const you = $derived([
		{ href: `/${session.handle}`, icon: 'me', label: t('settings.profile'), value: `@${session.handle}` },
		...(waiting ? [{ href: '/menu/outbox', icon: /** @type {const} */ ('suggestions'), label: t('outbox.title'), value: String(waiting) }] : []),
		{ onclick: out, icon: 'signout', label: t('me.signout') }
	]);
	// The other Bluesky accounts signed in here: publish as one of them in a tap (as yourself, as your organization).
	const others = $derived([
		...accounts()
			.list.filter((a) => a.did !== session.did)
			.map((a) => ({ onclick: () => switchAccount(a.did), icon: /** @type {const} */ ('me'), label: t('accounts.use', { handle: a.handle || a.did }) })),
		{ href: '/signin?add', icon: /** @type {const} */ ('signin'), label: t('accounts.add') }
	]);
	const yours = $derived([
		{ href: '/me/searches', icon: /** @type {const} */ ('search'), label: t('saved.searches'), value: formatNumber(searches.list.length) },
		{ href: '/me/lists', icon: /** @type {const} */ ('lists'), label: t('nav.lists'), value: formatNumber(own.lists.reduce((n, l) => n + l.count, 0)) }
	]);
	const browser = $derived([
		{ href: '/menu/language', icon: /** @type {const} */ ('language'), label: t('about.language'), value: t(`locale.${i18n.locale}`) },
		{ href: '/menu/collections', icon: /** @type {const} */ ('saved'), label: t('collections.transfer') },
		{ href: '/apps', icon: /** @type {const} */ ('embed'), label: t('menu.apps') }
	]);
	const about = $derived([
		{ href: config.source, icon: /** @type {const} */ ('about'), label: t('menu.source'), external: true },
		{ href: '/llms.txt', icon: /** @type {const} */ ('embed'), label: t('menu.agents'), external: true }
	]);
</script>

<svelte:head><title>{t('nav.menu')} · {config.name}</title></svelte:head>

<jl-menu-page>
	<h1>{t('nav.menu')}</h1>
	<MenuLinks label={t('me.here')} items={yours} />
	{#if session.handle}
		<MenuLinks label={t('settings.account')} items={you} />
		<MenuLinks label={t('accounts.others')} items={others} />
	{:else}
		<section aria-labelledby="menu-signin">
			<h2 id="menu-signin">{t('settings.account')}</h2>
			<menu><li><a href="/signin"><Icon name="signin" /> {t('nav.signin')}</a></li></menu>
		</section>
	{/if}
	<MenuLinks label={t('settings.browser')} items={browser} />
	<MenuLinks label={t('menu.about')} items={about} />
</jl-menu-page>

<style>
	/* One column to scan, as wide as a phone even on a desktop. */
	jl-menu-page {
		display: block;
		max-width: var(--reading-width);
		margin-inline: auto;
		padding-bottom: var(--space-xl);
	}
	section[aria-labelledby='menu-signin'] {
		margin-top: var(--space-l);
	}
	/* As the other groups' (MenuLinks). */
	h2 {
		margin-bottom: var(--space-xs);
		color: var(--color-muted);
		font-size: var(--font-size-small);
	}
	section[aria-labelledby='menu-signin'] a {
		background: var(--color-accent);
		color: var(--color-accent-fg);
		border-color: var(--color-accent);
	}
</style>
