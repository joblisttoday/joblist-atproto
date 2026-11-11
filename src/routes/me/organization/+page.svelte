<script>
	import { goto } from '$app/navigation';
	import config from '#lib/data/config.json';
	import Empty from '#lib/components/Empty.svelte';
	import OrganizationProfile from '#lib/components/OrganizationProfile.svelte';
	import { keptUrl, knownBy } from '#lib/models/kept.js';
	import { readAddress } from '#lib/navigation/address.js';
	import { data } from '#lib/network/network.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * A kept organization's profile: /me/organization#url=… (after the "#": the link is
	 * never sent to any server). One joblist knows has its own page; another, what this
	 * browser finds of it (OrganizationProfile).
	 */
	let link = $state(keptUrl(readAddress(['url']).get('url') || ''));
	$effect(() => {
		const onhash = () => (link = keptUrl(readAddress(['url']).get('url') || ''));
		addEventListener('hashchange', onhash);
		return () => removeEventListener('hashchange', onhash);
	});
	const known = $derived(link ? knownBy(data.companies)(link) : undefined);
	$effect(() => {
		if (known) goto(`/company/${known.key}`, { replace: true });
	});
</script>


<jl-me-organization>
	{#if link && !known}
		{#key link}<OrganizationProfile {link} address={{ url: link }} />{/key}
	{:else if !link}
		<Empty text={t('kept.invalid')}><a href="/me/organizations">{t('kept.title')}</a></Empty>
	{/if}
</jl-me-organization>

<style>
	jl-me-organization {
		display: block;
	}
</style>
