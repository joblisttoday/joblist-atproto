<script>
	import { goto } from '$app/navigation';
	import SignIn from '#lib/components/SignIn.svelte';
	import { session } from '#lib/auth/session.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	$effect(() => {
		if (session.did) goto('/me', { replace: true });
	});
</script>

<h1>{t('signin.title')}</h1>
<p>{t('signin.intro')}</p>
<SignIn />
