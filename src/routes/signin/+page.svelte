<script>
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import config from '#lib/data/config.json';
	import SignIn from '#lib/components/SignIn.svelte';
	import { session } from '#lib/auth/session.svelte.js';
	import { nextPath } from '#lib/navigation/next.js';
	import { t } from '#lib/i18n/index.svelte.js';

	// Signing in is for organizations (their domain as their handle): how, in three steps.
	// Signed in already: on to the next page, or its own page; unless adding another account (/signin?add).
	const adding = $derived(page.url.searchParams.has('add'));
	$effect(() => {
		if (session.handle && !adding) goto(nextPath(page.url.searchParams) || `/${session.handle}`, { replace: true });
	});
</script>

<svelte:head><title>{t('signin.title')} · {config.name}</title></svelte:head>

<jl-signin>
	<h1>{adding && session.handle ? t('accounts.add') : t('signin.title')}</h1>
	<p>{t('orgs.intro')}</p>
	<ol>
		<li>{t('orgs.step.handle')} <a href={config.links.handleHelp} target="_blank" rel="noopener">{t('company.claim.how')}</a></li>
		<li>{t('orgs.step.signin')}</li>
		<li>{t('orgs.step.describe')}</li>
	</ol>
	<SignIn />
</jl-signin>

<style>
	jl-signin {
		display: block;
		max-width: var(--reading-width);
		margin-inline: auto;
		padding-bottom: var(--space-xl);
	}
	ol {
		padding-inline-start: var(--space-l);
		list-style: decimal;
	}
	li + li {
		margin-top: var(--space-xs);
	}
</style>
