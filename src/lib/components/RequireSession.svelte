<script>
	import SignIn from './SignIn.svelte';
	import { session } from '#lib/auth/session.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/** @type {{children: import('svelte').Snippet}} */
	let { children } = $props();
</script>

{#if !session.ready}
	<p><small>…</small></p>
{:else if session.did}
	{@render children()}
{:else}
	<p>{t('signin.required')}</p>
	<SignIn />
{/if}
