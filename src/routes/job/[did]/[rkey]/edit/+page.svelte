<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import config from '#lib/data/config.json';
	import JobForm from '#lib/components/JobForm.svelte';
	import OwnOnly from '#lib/components/OwnOnly.svelte';
	import { getRecord } from '#lib/atproto.js';
	import { loadJob } from '#lib/profile.js';
	import { jobPath } from '#lib/records.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/** Changing an offer (/job/{did}/{rkey}/edit): its organization's own account's; also to show it longer. */
	const did = $derived(page.params.did || '');
	const rkey = $derived(page.params.rkey || '');
	/** @type {Awaited<ReturnType<typeof loadJob>> | undefined} */
	let job = $state(undefined);
	/** Its organization's record (its places). @type {Record<string, any> | null} */
	let companyValue = $state(null);
	$effect(() => {
		loadJob(did, rkey).then(
			async (j) => {
				companyValue = j ? ((await getRecord(did, config.collections.company, j.company).catch(() => null))?.value ?? null) : null;
				job = j;
			},
			() => (job = null)
		);
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
		<JobForm company={job.company} {companyValue} {rkey} value={job.value} onsaved={() => goto(jobPath(did, rkey))} oncancel={() => history.back()} />
	</OwnOnly>
{/if}
