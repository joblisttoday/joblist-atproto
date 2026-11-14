<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import config from '#lib/data/config.json';
	import CompanyForm from '#lib/components/CompanyForm.svelte';
	import OwnOnly from '#lib/components/OwnOnly.svelte';
	import { getRecord } from '#lib/atproto.js';
	import { domainOf } from '#lib/profile.js';
	import { session } from '#lib/session.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/** Describing one's organization (/{domain}/edit): its own account's, its record read first. */
	const domain = $derived(domainOf(page.params.handle || ''));
	/** undefined while read @type {Record<string, any> | null | undefined} */
	let value = $state(undefined);
	$effect(() => {
		const did = session.handle === domain ? session.did : null;
		if (did) getRecord(did, config.collections.company, domain).then((r) => (value = r?.value || null), () => (value = null));
	});
</script>

<svelte:head><title>{t('company.title')} · {config.name}</title></svelte:head>

<OwnOnly handle={domain}>
	<h1>{t('company.title')}</h1>
	{#if value !== undefined}
		<CompanyForm {domain} {value} onsaved={() => goto(`/${domain}`)} oncancel={() => history.back()} />
	{/if}
</OwnOnly>
