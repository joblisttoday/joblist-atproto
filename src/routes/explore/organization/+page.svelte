<script>
	import { goto } from '$app/navigation';
	import config from '#lib/data/config.json';
	import Empty from '#lib/components/Empty.svelte';
	import OrganizationProfile from '#lib/components/OrganizationProfile.svelte';
	import { keptUrl, knownBy, organizationPage } from '#lib/models/kept.js';
	import { readParams } from '#lib/models/paste.js';
	import { readAddress } from '#lib/navigation/address.js';
	import { data } from '#lib/network/network.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * A kept organization's profile: /explore/organization#url=… (after the "#": the link is
	 * never sent to any server). One joblist knows has its own page; another, what this
	 * browser finds of it (OrganizationProfile). Shared to joblist from a phone (the share
	 * target: ?url=…&text=…&title=…), it opens the same way.
	 */
	const shared = readParams(new URLSearchParams(location.search)).link;
	const sharedTo = shared ? organizationPage(shared, () => undefined) : null;
	if (sharedTo) goto(sharedTo.href, { replace: true });
	let link = $state(keptUrl(readAddress(['url']).get('url') || ''));
	$effect(() => {
		const onhash = () => (link = keptUrl(readAddress(['url']).get('url') || ''));
		addEventListener('hashchange', onhash);
		return () => removeEventListener('hashchange', onhash);
	});
	const known = $derived(link ? knownBy(data.companies)(link) : undefined);
	$effect(() => {
		if (known) goto(`/${known.key}`, { replace: true });
	});
</script>


<jl-me-organization>
	{#if link && !known}
		{#key link}<OrganizationProfile {link} address={{ url: link }} />{/key}
	{:else if !link}
		<Empty text={t('kept.invalid')}><a href="/">{t('nav.home')}</a></Empty>
	{/if}
</jl-me-organization>

<style>
	jl-me-organization {
		display: block;
	}
</style>
