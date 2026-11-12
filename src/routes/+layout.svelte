<script>
	import '../app.css';
	import favicon from '#lib/assets/favicon.svg';
	import config from '#lib/data/config.json';
	import Header from '#lib/components/Header.svelte';
	import OutboxStatus from '#lib/components/OutboxStatus.svelte';
	import { startOutbox } from '#lib/network/outbox.svelte.js';
	import { initSession } from '#lib/auth/session.svelte.js';
	import { startNetwork } from '#lib/network/network.svelte.js';
	import { i18n, t } from '#lib/i18n/index.svelte.js';
	import { registerTools } from '#lib/webmcp.js';

	/** @type {{children: import('svelte').Snippet}} */
	let { children } = $props();

	initSession();
	startOutbox();
	startNetwork();
	registerTools();

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

<a href="#main">{t('nav.skip')}</a>
<Header />
<OutboxStatus />
<main id="main" tabindex="-1">
	{@render children()}
</main>

<style>
	a[href='#main'] {
		position: absolute;
		left: var(--space-s);
		top: calc(-1 * var(--tap-size) * 2);
		z-index: 20;
		display: flex;
		align-items: center;
		min-height: var(--tap-size);
		padding: 0 var(--space-m);
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
