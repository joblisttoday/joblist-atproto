<script>
	import config from '#lib/data/config.json';
	import MenuLinks from '#lib/components/MenuLinks.svelte';
	import { session } from '#lib/auth/session.svelte.js';
	import { ownDomain } from '#lib/models/company.js';
	import { i18n, t } from '#lib/i18n/index.svelte.js';

	/**
	 * The menu, one short list: who you are (this device, or an account signed in: Switch
	 * account), for organizations, then this browser's settings, then the source.
	 */
	const own = $derived(ownDomain(session.handle));

	/** @type {import('#lib/navigation/nav.js').MenuLink[]} */
	const rows = $derived([
		{ href: '/menu/accounts', icon: /** @type {const} */ ('me'), label: t('accounts.you'), value: session.handle ? `@${session.handle}` : t('accounts.device') },
		{ href: '/org', icon: /** @type {const} */ ('companies'), label: own ? t('orgs.yours') : t('menu.hiring'), value: own ? `@${own}` : undefined },
		...(own ? [{ href: '/jobs', icon: /** @type {const} */ ('jobs'), label: t('menu.browse') }] : []),
		{ href: '/menu/language', icon: /** @type {const} */ ('language'), label: t('about.language'), value: t(`locale.${i18n.locale}`) },
		{ href: '/menu/collections', icon: /** @type {const} */ ('saved'), label: t('collections.transfer') },
		{ href: '/menu/apps', icon: /** @type {const} */ ('embed'), label: t('menu.apps') },
		{ href: config.source, icon: /** @type {const} */ ('about'), label: t('menu.source'), external: true }
	]);
</script>

<svelte:head><title>{t('nav.menu')} · {config.name}</title></svelte:head>

<jl-menu-page>
	<h1>{t('nav.menu')}</h1>
	<MenuLinks label={t('nav.menu')} items={rows} hidden />
</jl-menu-page>

<style>
	/* One column to scan, as wide as a phone even on a desktop. */
	jl-menu-page {
		display: block;
		max-width: var(--reading-width);
		margin-inline: auto;
		padding-bottom: var(--space-xl);
	}
</style>
