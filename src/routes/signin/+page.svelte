<script>
	import config from '#lib/data/config.json';
	import SignIn from '#lib/components/SignIn.svelte';
	import { session } from '#lib/session.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/** Signing in (/signin): an organization, its domain as its handle; then its page (/{domain}). */
</script>

<svelte:head><title>{t('signin.title')} · {config.name}</title></svelte:head>

<h1>{t('signin.title')}</h1>
{#if !session.ready}
	<p><small>…</small></p>
{:else if session.handle}
	<p>{t('signin.as', { handle: session.handle })}</p>
	<menu><a href="/{session.handle}" data-primary>{t('company.title')}</a></menu>
{:else}
	<SignIn />
{/if}
