<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import config from '#lib/data/config.json';
	import JobForm from '#lib/components/JobForm.svelte';
	import OwnOnly from '#lib/components/OwnOnly.svelte';
	import { loadJob } from '#lib/profile.js';
	import { jobPath } from '#lib/records.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/** Changing an offer (/job/{did}/{rkey}/edit): its organization's own account's; also to show it longer. */
	const did = $derived(page.params.did || '');
	const rkey = $derived(page.params.rkey || '');
	/** @type {Awaited<ReturnType<typeof loadJob>> | undefined} */
	let job = $state(undefined);
	$effect(() => {
		loadJob(did, rkey).then((j) => (job = j), () => (job = null));
	});
</script>

<svelte:head><title>{t('post.edit')} · {config.name}</title></svelte:head>

{#if job === undefined}
	<p><small>…</small></p>
{:else if !job}
	<h1>{t('notFound.title')}</h1>
	<p>{t('job.notFound')}</p>
{:else}
	<OwnOnly handle={job.company}>
		<h1>{t('post.edit')}</h1>
		<JobForm company={job.company} {rkey} value={job.value} onsaved={() => goto(jobPath(did, rkey))} oncancel={() => history.back()} />
	</OwnOnly>
{/if}
