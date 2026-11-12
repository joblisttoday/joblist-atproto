<script>
	import Pending from './Pending.svelte';
	import { page } from '$app/state';
	import { session } from '#lib/auth/session.svelte.js';
	import { ownOrganization } from '#lib/network/own-organization.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * An organization's tools (/{domain}/edit, /post, /jobs/{rkey}): its own account's only.
	 * Anyone else: to sign in as it, and back here.
	 * @type {{handle: string, children: import('svelte').Snippet}}
	 */
	let { handle, children } = $props();
	const next = $derived(encodeURIComponent(page.url.pathname + page.url.search));
</script>

<jl-own>
	{#if !session.ready}
		<Pending />
	{:else if ownOrganization.own === handle}
		{@render children()}
	{:else}
		<h1>{t('signin.title')}</h1>
		<p>{t('signin.as', { handle })}</p>
		<menu><a href="/signin?next={next}" data-primary>{t('nav.signin')}</a></menu>
	{/if}
</jl-own>

<style>
	jl-own {
		display: block;
		max-width: var(--reading-width);
		margin-inline: auto;
		padding-bottom: var(--space-xl);
	}
	jl-own :global(h1 + p) {
		margin-top: 0;
	}
	jl-own :global([data-primary]) {
		background: var(--color-accent);
		color: var(--color-accent-fg);
		border-color: var(--color-accent);
	}
</style>
