<script>
	import config from '#lib/data/config.json';
	import Logo from '#lib/components/Logo.svelte';
	import SettingsLinks from '#lib/components/SettingsLinks.svelte';
	import { getProfile } from '#lib/atproto.js';
	import { session, signOut } from '#lib/session.svelte.js';
	import { i18n, t } from '#lib/i18n/index.svelte.js';

	/**
	 * Settings (/settings): who is signed in here, once and large (its page), else to sign in;
	 * then plain rows (the language, its own page; about joblist; the source); signing out last.
	 */
	/** Its Bluesky picture, when it comes */
	const avatar = $derived(session.did ? getProfile(session.did).then((p) => p?.avatar || '') : Promise.resolve(''));
	const language = $derived(new Intl.DisplayNames([i18n.locale], { type: 'language' }).of(i18n.locale) || i18n.locale);
</script>

<svelte:head><title>{t('nav.settings')} · {config.name}</title></svelte:head>

<h1>{t('nav.settings')}</h1>

{#if session.handle}
	<a href="/{session.handle}" data-you>
		<span data-avatar>
			{#await avatar then src}{#if src}<img {src} alt="" />{:else}{session.handle.charAt(0).toUpperCase()}{/if}{/await}
		</span>
		<strong>@{session.handle}</strong>
		<small>{t('company.title')}</small>
	</a>
{:else if session.ready}
	<SettingsLinks items={[{ href: '/signin', icon: 'signin', label: t('signin.title') }]} />
{/if}

<SettingsLinks
	items={[
		{ href: '/settings/language', icon: 'language', label: t('settings.language'), value: language },
		{ href: '/about', icon: 'about', label: t('settings.about') },
		{ href: config.source, icon: 'source', label: t('settings.source'), external: true }
	]}
/>

{#if session.handle}
	<SettingsLinks items={[{ icon: 'signout', label: t('signin.out'), onclick: signOut }]} />
{/if}

<footer>
	<a href="/about"><Logo />{config.name}</a>
</footer>

<style>
	/* joblist's mark, last, centered: about it. */
	footer {
		display: flex;
		justify-content: center;
		margin-top: var(--space-xl);
	}
	footer a {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-xs);
		min-height: var(--tap-size);
		padding: var(--space-s) var(--space-m);
		--logo-size: 2.5rem;
		color: var(--color-muted);
		font-weight: var(--font-weight-strong);
		text-decoration: none;
	}
	footer a:hover {
		color: var(--color-fg);
	}
	/* Who is signed in, once and large, centered. */
	[data-you] {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-xs);
		margin-bottom: var(--space-m);
		padding: var(--space-m);
		border-radius: var(--radius-large);
		color: inherit;
		text-align: center;
		text-decoration: none;
	}
	[data-you]:hover {
		background: var(--color-soft);
	}
	[data-avatar] {
		display: grid;
		place-items: center;
		width: 4rem;
		height: 4rem;
		margin-bottom: var(--space-xs);
		overflow: hidden;
		border-radius: var(--radius-large);
		background: var(--color-soft);
		font-size: var(--font-size-large);
		font-weight: var(--font-weight-strong);
	}
	[data-avatar] img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
	strong {
		max-width: 100%;
		font-size: var(--font-size-large);
		overflow-wrap: anywhere;
	}
	small {
		color: var(--color-muted);
	}
</style>
