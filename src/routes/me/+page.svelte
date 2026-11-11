<script>
	import config from '#lib/data/config.json';
	import MenuLinks from '#lib/components/MenuLinks.svelte';
	import PageHeader from '#lib/components/PageHeader.svelte';
	import { session } from '#lib/auth/session.svelte.js';
	import { kept } from '#lib/network/kept.svelte.js';
	import { own } from '#lib/network/own-lists.svelte.js';
	import { searches } from '#lib/network/saved-searches.svelte.js';
	import { formatNumber, t } from '#lib/i18n/index.svelte.js';

	/**
	 * What is yours, as even rows: your searches, organizations and lists of jobs (kept in
	 * this browser, signed in or not), each with how many and its own page; then your
	 * account (signing in is only for publishing).
	 */
	const jobs = $derived(own.lists.reduce((n, l) => n + l.count, 0));

	/** @type {import('#lib/navigation/nav.js').MenuLink[]} */
	const here = $derived([
		{ href: '/me/searches', icon: 'search', label: t('saved.searches'), value: formatNumber(searches.list.length) },
		{ href: '/me/organizations', icon: 'companies', label: t('kept.short'), value: formatNumber(kept.list.length) },
		{ href: '/me/lists', icon: 'lists', label: t('nav.lists'), value: formatNumber(jobs) }
	]);
	/** @type {import('#lib/navigation/nav.js').MenuLink[]} */
	const account = $derived([
		session.handle
			? { href: `/${session.handle}`, icon: 'me', label: t('settings.profile'), value: `@${session.handle}` }
			: { href: '/signin', icon: 'signin', label: t('nav.signin') }
	]);
</script>

<svelte:head><title>{t('nav.me')} · {config.name}</title></svelte:head>

<jl-me>
	<PageHeader title={t('nav.me')} intro={t('me.intro')} />
	<MenuLinks label={t('me.here')} items={here} />
	<MenuLinks label={t('me.account')} items={account} />
</jl-me>

<style>
	/* One column to scan, as wide as a phone even on a desktop. */
	jl-me {
		display: block;
		max-width: var(--reading-width);
		margin-inline: auto;
		padding-bottom: var(--space-xl);
	}
</style>
