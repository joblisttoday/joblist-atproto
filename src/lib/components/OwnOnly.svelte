<script>
	import SignIn from './SignIn.svelte';
	import { page } from '$app/state';
	import { session } from '#lib/session.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * What only an organization's own account does (edit it, post a job, change an offer):
	 * signed in as it, the page; else, to sign in as it, and back here.
	 * @type {{handle: string, children: import('svelte').Snippet}}
	 */
	let { handle, children } = $props();
</script>

{#if !session.ready}
	<p><small>…</small></p>
{:else if session.handle === handle}
	{@render children()}
{:else}
	<h1>{t('signin.title')}</h1>
	<p>{t('own.only', { handle })}</p>
	<SignIn back={page.url.pathname} />
{/if}
