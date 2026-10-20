<script>
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import config from '#lib/data/config.json';
	import SignIn from '#lib/components/SignIn.svelte';
	import { session } from '#lib/auth/session.svelte.js';
	import { nextPath } from '#lib/navigation/next.js';
	import { t } from '#lib/i18n/index.svelte.js';

	$effect(() => {
		if (session.handle) goto(nextPath(page.url.searchParams) || `/${session.handle}`, { replace: true });
	});
</script>

<svelte:head><title>{t('signin.title')} · {config.name}</title></svelte:head>

<h1>{t('signin.title')}</h1>
<p>{t('signin.intro')}</p>
<SignIn />
