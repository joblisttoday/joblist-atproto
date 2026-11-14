<script>
	import { page } from '$app/state';
	import config from '#lib/data/config.json';
	import OwnOnly from '#lib/components/OwnOnly.svelte';
	import SettingsHeader from '#lib/components/SettingsHeader.svelte';
	import SettingsLinks from '#lib/components/SettingsLinks.svelte';
	import { getRecord } from '#lib/atproto.js';
	import { domainOf } from '#lib/profile.js';
	import { toCompany } from '#lib/records.js';
	import { session } from '#lib/session.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Describing one's organization (/{domain}/edit): its parts, each with what it says now,
	 * each on its own page (/{domain}/edit/{part}).
	 */
	const domain = $derived(domainOf(page.params.handle || ''));
	/** undefined while read @type {Record<string, any> | null | undefined} */
	let value = $state(undefined);
	$effect(() => {
		const did = session.handle === domain ? session.did : null;
		if (did) getRecord(did, config.collections.company, domain).then((r) => (value = r?.value || null), () => (value = null));
	});
	const c = $derived(toCompany(value || {}));
	const parts = $derived([
		{ href: `/${domain}/edit/about`, icon: /** @type {const} */ ('edit'), label: t('company.about'), value: c.name || t('profile.notDescribed') },
		{ href: `/${domain}/edit/kind`, icon: /** @type {const} */ ('kind'), label: t('company.kind'), value: c.kind ? t(`kind.${c.kind}`) : t('kind.none') },
		{ href: `/${domain}/edit/tags`, icon: /** @type {const} */ ('tag'), label: t('company.tags'), value: c.tags.join(', ') },
		{ href: `/${domain}/edit/places`, icon: /** @type {const} */ ('place'), label: t('form.locations'), value: c.locations.length ? String(c.locations.length) : '' },
		{ href: `/${domain}/edit/links`, icon: /** @type {const} */ ('link'), label: t('form.links'), value: c.links.length ? String(c.links.length) : '' }
	]);
</script>

<svelte:head><title>{t('company.title')} · {config.name}</title></svelte:head>

<OwnOnly handle={domain}>
	<SettingsHeader title={t('company.title')} back="/{domain}" backLabel={domain} />
	{#if value !== undefined}<SettingsLinks items={parts} />{/if}
</OwnOnly>
