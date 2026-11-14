<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import config from '#lib/data/config.json';
	import JobForm from '#lib/components/JobForm.svelte';
	import OwnOnly from '#lib/components/OwnOnly.svelte';
	import { getRecord } from '#lib/atproto.js';
	import { domainOf } from '#lib/profile.js';
	import { jobPath } from '#lib/records.js';
	import { session } from '#lib/session.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/** Posting a job (/{domain}/post), from the organization's own account; then its page. */
	const domain = $derived(domainOf(page.params.handle || ''));
	/** Its organization's record (its places), read first: undefined while read. @type {Record<string, any> | null | undefined} */
	let companyValue = $state(undefined);
	$effect(() => {
		const did = session.handle === domain ? session.did : null;
		if (did) getRecord(did, config.collections.company, domain).then((r) => (companyValue = r?.value || null), () => (companyValue = null));
	});
</script>

<svelte:head><title>{t('post.title')} · {config.name}</title></svelte:head>

<OwnOnly handle={domain}>
	<h1>{t('post.title')}</h1>
	<p><small>{t('post.intro')}</small></p>
	{#if companyValue !== undefined}
		<JobForm company={domain} {companyValue} onsaved={(rkey) => goto(jobPath(/** @type {string} */ (session.did), rkey))} oncancel={() => history.back()} />
	{/if}
</OwnOnly>
