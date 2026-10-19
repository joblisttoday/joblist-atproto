<script>
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import config from '#lib/data/config.json';
	import JobForm from '#lib/components/JobForm.svelte';
	import RequireSession from '#lib/components/RequireSession.svelte';
	import { session } from '#lib/auth/session.svelte.js';
	import { postPath } from '#lib/models/job-post.js';
	import { t } from '#lib/i18n/index.svelte.js';

	// /jobs/new?company=key starts with the company chosen.
	const company = $derived(page.url.searchParams.get('company') || '');
</script>

<svelte:head><title>{t('post.title')} · {config.name}</title></svelte:head>

<h1>{t('post.title')}</h1>
<p><small>{t('post.intro')}</small></p>

<RequireSession>
	{#key company}
		<JobForm
			{company}
			onsaved={(rkey) => goto(postPath(/** @type {string} */ (session.did), rkey))}
			oncancel={() => history.back()}
		/>
	{/key}
</RequireSession>
