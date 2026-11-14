<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import config from '#lib/data/config.json';
	import CompanyForm from '#lib/components/CompanyForm.svelte';
	import OwnOnly from '#lib/components/OwnOnly.svelte';
	import SettingsHeader from '#lib/components/SettingsHeader.svelte';
	import { getRecord } from '#lib/atproto.js';
	import { domainOf } from '#lib/profile.js';
	import { session } from '#lib/session.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/** One part of describing one's organization (/{domain}/edit/{part}); saved, back to its parts. */
	const domain = $derived(domainOf(page.params.handle || ''));
	const section = $derived(config.companyForm.sections.includes(page.params.section || '') ? page.params.section || '' : '');
	const titles = /** @type {Record<string, string>} */ ({ about: 'company.about', kind: 'company.kind', tags: 'company.tags', places: 'form.locations', links: 'form.links' });
	/** undefined while read @type {Record<string, any> | null | undefined} */
	let value = $state(undefined);
	$effect(() => {
		const did = session.handle === domain ? session.did : null;
		if (did) getRecord(did, config.collections.company, domain).then((r) => (value = r?.value || null), () => (value = null));
	});
</script>

<svelte:head><title>{section ? t(titles[section]) : t('notFound.title')} · {config.name}</title></svelte:head>

{#if !section}
	<h1>{t('notFound.title')}</h1>
	<p>{t('notFound.text')}</p>
{:else}
	<OwnOnly handle={domain}>
		<SettingsHeader title={t(titles[section])} back="/{domain}/edit" backLabel={t('company.title')} />
		{#if value !== undefined}
			{#key section}
				<CompanyForm {domain} {section} {value} onsaved={() => goto(`/${domain}/edit`)} oncancel={() => history.back()} />
			{/key}
		{/if}
	</OwnOnly>
{/if}
