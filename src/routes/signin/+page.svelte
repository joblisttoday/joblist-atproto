<script>
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import config from '#lib/data/config.json';
	import SignIn from '#lib/components/SignIn.svelte';
	import { session } from '#lib/auth/session.svelte.js';
	import { nextPath } from '#lib/navigation/next.js';
	import { t } from '#lib/i18n/index.svelte.js';

	// Signing in is for organizations (their domain as their handle). Signed in already: on to
	// the next page, or the organization's; unless adding another account (/signin?add).
	const adding = $derived(page.url.searchParams.has('add'));
	$effect(() => {
		if (session.handle && !adding) goto(nextPath(page.url.searchParams) || '/org', { replace: true });
	});
</script>

<svelte:head><title>{t('signin.title')} · {config.name}</title></svelte:head>

<h1>{adding && session.handle ? t('accounts.add') : t('signin.title')}</h1>
<p>{t('signin.intro')}</p>
<SignIn />
