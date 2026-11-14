<script>
	import '../app.css';
	import favicon from '#lib/assets/favicon.svg';
	import config from '#lib/data/config.json';
	import Icon from '#lib/components/Icon.svelte';
	import { initSession, session } from '#lib/session.svelte.js';
	import { page } from '$app/state';
	import { i18n, t } from '#lib/i18n/index.svelte.js';

	/**
	 * Every page, then its tabs at the bottom, centered: Home (with search), the signed-in
	 * organization's page (else Sign in), Settings.
	 * @type {{children: import('svelte').Snippet}}
	 */
	let { children } = $props();
	initSession();
	$effect(() => {
		document.documentElement.lang = i18n.locale;
	});
	const path = $derived(page.url.pathname);
	/** @param {boolean} on */
	const current = (on) => (on ? 'page' : undefined);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>{config.name}</title>
	<!-- Cookieless page views (Umami, a pinned copy served from here: static/vendor/), only on the production domain. -->
	<script defer src={config.analytics.script} data-host-url={config.analytics.hostUrl} data-website-id={config.analytics.websiteId} data-domains={config.analytics.domains} data-exclude-search="true"></script>
</svelte:head>

<main id="main">
	{@render children()}
</main>
<jl-nav>
	<nav aria-label={t('nav.label')}>
		<a href="/" aria-current={current(path === '/')}><Icon name="home" />{t('nav.home')}</a>
		{#if session.handle}
			<a href="/{session.handle}" aria-current={current(path === `/${session.handle}` || path.startsWith(`/${session.handle}/`))}><Icon name="organization" />{t('nav.organization')}</a>
		{:else}
			<a href="/signin" aria-current={current(path === '/signin')}><Icon name="signin" />{t('signin.title')}</a>
		{/if}
		<a href="/settings" aria-current={current(path === '/settings')}><Icon name="settings" />{t('nav.settings')}</a>
	</nav>
</jl-nav>

<style>
	/* Floating at the bottom, space around it, rounded; as wide as reading, centered. */
	jl-nav {
		position: fixed;
		inset: auto var(--float-space) calc(var(--float-space) + env(safe-area-inset-bottom));
		z-index: 10;
		max-width: var(--reading-width);
		margin-inline: auto;
		background: var(--color-bar);
		backdrop-filter: blur(12px);
		border: var(--border);
		border-radius: var(--radius-large);
		box-shadow: var(--shadow-menu);
	}
	nav {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: minmax(0, 1fr);
	}
	/* The icon above its label. */
	a {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
		align-items: center;
		justify-content: center;
		min-height: var(--nav-height);
		padding: 0 var(--space-xs);
		font-size: var(--font-size-small);
		text-decoration: none;
		text-align: center;
		color: var(--color-muted);
		-webkit-tap-highlight-color: transparent;
	}
	a:hover,
	a[aria-current='page'] {
		color: var(--color-fg);
	}
	a[aria-current='page'] {
		font-weight: var(--font-weight-strong);
	}
</style>
