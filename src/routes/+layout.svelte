<script>
	import '../app.css';
	import favicon from '#lib/assets/favicon.svg';
	import config from '#lib/data/config.json';
	import Logo from '#lib/components/Logo.svelte';
	import { initSession, session } from '#lib/session.svelte.js';
	import { page } from '$app/state';
	import { i18n, t } from '#lib/i18n/index.svelte.js';

	/**
	 * Every page: joblist's mark (home), the signed-in organization's page (else, to sign in) and
	 * settings, then the page, then the source.
	 * @type {{children: import('svelte').Snippet}}
	 */
	let { children } = $props();
	initSession();
	$effect(() => {
		document.documentElement.lang = i18n.locale;
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>{config.name}</title>
	<!-- Cookieless page views (Umami, a pinned copy served from here: static/vendor/), only on the production domain. -->
	<script defer src={config.analytics.script} data-host-url={config.analytics.hostUrl} data-website-id={config.analytics.websiteId} data-domains={config.analytics.domains} data-exclude-search="true"></script>
</svelte:head>

<header>
	<a href="/"><Logo /><b>{config.name}</b></a>
	<nav>
		{#if session.handle}
			<a href="/{session.handle}" aria-current={page.url.pathname.startsWith(`/${session.handle}`) ? 'page' : undefined}>{t('nav.organization')}</a>
		{:else if session.ready}
			<a href="/signin" aria-current={page.url.pathname === '/signin' ? 'page' : undefined}>{t('signin.title')}</a>
		{/if}
		<a href="/settings" aria-current={page.url.pathname === '/settings' ? 'page' : undefined}>{t('nav.settings')}</a>
	</nav>
</header>
<main id="main">
	{@render children()}
</main>
<footer>
	<a href={config.source} target="_blank" rel="noopener">{t('footer.source')}</a>
</footer>

<style>
	header,
	footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-m);
		width: 100%;
		max-width: calc(var(--reading-width) + 2 * var(--gutter));
		margin-inline: auto;
		padding: var(--space-s) var(--gutter);
	}
	header a,
	footer a {
		display: inline-flex;
		align-items: center;
		gap: var(--space-s);
		min-height: var(--tap-size);
		text-decoration: none;
	}
	nav {
		display: flex;
		gap: var(--space-m);
	}
	nav a[aria-current] {
		text-decoration: underline;
	}
	footer {
		justify-content: flex-end;
		border-top: var(--border);
		font-size: var(--font-size-small);
	}
</style>
