<script>
	import FormPage from '#lib/components/FormPage.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import config from '#lib/data/config.json';
	import JobForm from '#lib/components/JobForm.svelte';
	import DataState from '#lib/components/DataState.svelte';
	import Pending from '#lib/components/Pending.svelte';
	import RequireSession from '#lib/components/RequireSession.svelte';
	import { session } from '#lib/auth/session.svelte.js';
	import { postPath } from '#lib/models/job-post.js';
	import { t } from '#lib/i18n/index.svelte.js';
	import { findPost } from '#lib/network/find-post.svelte.js';

	// Its own offer (/org/jobs/{rkey}): the account signed in posted it.
	const did = $derived(session.did || '');
	const found = findPost(() => ({ did, rkey: page.params.rkey || '' }));
	const post = $derived(found.post);
</script>

<svelte:head><title>{t('post.edit')} · {config.name}</title></svelte:head>

<FormPage>
	<h1>{t('post.edit')}</h1>

	<RequireSession>
		{#if post && session.did === post.did}
			{#key post.uri}
				<JobForm
					{post}
					onsaved={(rkey) => goto(postPath(did, rkey))}
					oncancel={() => history.back()}
				/>
			{/key}
		{:else if found.unreachable}
			<DataState state="unreachable" />
		{:else if post === undefined}
			<Pending />
		{:else}
			<p>{t('job.notFound')}</p>
		{/if}
	</RequireSession>
</FormPage>
