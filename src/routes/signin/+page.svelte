<script>
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import config from '#lib/data/config.json';
	import SignIn from '#lib/components/SignIn.svelte';
	import { session } from '#lib/auth/session.svelte.js';
	import { nextPath } from '#lib/navigation/next.js';
	import { t } from '#lib/i18n/index.svelte.js';

	// Signed in already: on to the next page, unless adding another account (/signin?add).
	const adding = $derived(page.url.searchParams.has('add'));
	$effect(() => {
		if (session.handle && !adding) goto(nextPath(page.url.searchParams) || `/${session.handle}`, { replace: true });
	});
</script>

<svelte:head><title>{t('signin.title')} · {config.name}</title></svelte:head>

<h1>{t('signin.title')}</h1>
<p>{adding && session.handle ? t('accounts.add.intro', { handle: session.handle }) : t('signin.intro')}</p>
<SignIn />
