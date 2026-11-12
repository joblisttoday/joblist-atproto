<script>
	import FormPage from '#lib/components/FormPage.svelte';
	import OwnOnly from '#lib/components/OwnOnly.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import config from '#lib/data/config.json';
	import JobForm from '#lib/components/JobForm.svelte';
	import { session } from '#lib/auth/session.svelte.js';
	import { postPath } from '#lib/models/job-post.js';
	import { t } from '#lib/i18n/index.svelte.js';

	// Posting a job (/{domain}/post, its own account's: OwnOnly); ?company=key starts with the
	// company chosen. Once posted: its page.
	const company = $derived(page.url.searchParams.get('company') || '');
</script>

<svelte:head><title>{t('post.title')} · {config.name}</title></svelte:head>

<OwnOnly handle={page.params.handle || ''}>
<FormPage>
	<h1>{t('post.title')}</h1>
	<p><small>{t('post.intro')}</small></p>

	{#key company}
		<JobForm
			{company}
			onsaved={(rkey) => goto(postPath(/** @type {string} */ (session.did), rkey))}
			oncancel={() => history.back()}
		/>
	{/key}
</FormPage>
</OwnOnly>
