<script>
	import '../app.css';
	import favicon from '#lib/assets/favicon.svg';
	import config from '#lib/data/config.json';
	import Nav from '#lib/components/Nav.svelte';
	import { initSession } from '#lib/auth/session.svelte.js';
	import { startNetwork } from '#lib/network/network.svelte.js';
	import { i18n } from '#lib/i18n/index.svelte.js';

	/** @type {{children: import('svelte').Snippet}} */
	let { children } = $props();

	initSession();
	startNetwork();

	$effect(() => {
		document.documentElement.lang = i18n.locale;
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>{config.name}</title>
</svelte:head>

<main>
	{@render children()}
</main>
<Nav />
