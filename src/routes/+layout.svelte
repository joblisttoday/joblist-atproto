<script>
	import '../app.css';
	import { afterNavigate } from '$app/navigation';
	import favicon from '#lib/assets/favicon.svg';
	import config from '#lib/data/config.json';
	import Header from '#lib/components/Header.svelte';
	import Footer from '#lib/components/Footer.svelte';
	import { initSession } from '#lib/auth/session.svelte.js';
	import { startNetwork } from '#lib/network/network.svelte.js';
	import { history } from '#lib/navigation/history.svelte.js';
	import { i18n, t } from '#lib/i18n/index.svelte.js';
	import { registerTools } from '#lib/webmcp.js';

	/** @type {{children: import('svelte').Snippet}} */
	let { children } = $props();

	initSession();
	startNetwork();
	registerTools();

	afterNavigate(({ from }) => {
		if (from) history.inApp = true;
	});

	$effect(() => {
		document.documentElement.lang = i18n.locale;
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>{config.name}</title>
	<!-- Cookieless page views (Umami), only on the production domain. -->
	<script defer src={config.analytics.script} data-website-id={config.analytics.websiteId} data-domains={config.analytics.domains}></script>
</svelte:head>

<a href="#main">{t('nav.skip')}</a>
<Header />
<main id="main" tabindex="-1">
	{@render children()}
</main>
<Footer />

<style>
	a[href='#main'] {
		position: absolute;
		left: var(--space-s);
		top: calc(-1 * var(--tap-size) * 2);
		z-index: 20;
		padding: var(--space-s) var(--space-m);
		background: var(--color-accent);
		color: var(--color-accent-fg);
	}
	a[href='#main']:focus {
		top: var(--space-s);
	}
	main:focus {
		outline: none;
	}
</style>
