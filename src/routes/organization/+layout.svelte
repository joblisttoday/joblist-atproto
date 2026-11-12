<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { session } from '#lib/auth/session.svelte.js';
	import { ownOrganization } from '#lib/network/own-organization.svelte.js';

	/**
	 * The organization's dashboard and its pages (/organization/page, /jobs, /embed): one
	 * column. Its pages are its account's only: anyone else is sent to /organization (how to sign in).
	 * @type {{children: import('svelte').Snippet}}
	 */
	let { children } = $props();
	$effect(() => {
		if (session.ready && !ownOrganization.own && page.url.pathname !== '/organization') goto('/organization', { replace: true });
	});
</script>

<jl-organization>{@render children()}</jl-organization>

<style>
	jl-organization {
		display: block;
		max-width: var(--reading-width);
		margin-inline: auto;
		padding-bottom: var(--space-xl);
	}
	jl-organization :global(h1 + p) {
		margin-top: 0;
	}
	jl-organization :global([data-primary]) {
		background: var(--color-accent);
		color: var(--color-accent-fg);
		border-color: var(--color-accent);
	}
</style>
