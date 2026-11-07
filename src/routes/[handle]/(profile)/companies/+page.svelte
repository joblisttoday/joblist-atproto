<script>
	import Icon from '#lib/components/Icon.svelte';
	import config from '#lib/data/config.json';
	import Companies from '#lib/components/Companies.svelte';
	import Empty from '#lib/components/Empty.svelte';
	import { companiesBy, getProfile } from '#lib/network/profile.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	// The organizations an account described (any version of theirs).
	const profile = getProfile();
	const companies = $derived(profile.did ? companiesBy(profile.did) : []);
</script>

<svelte:head><title>@{profile.handle} · {t('profile.companies')} · {config.name}</title></svelte:head>

<section aria-labelledby="profile-companies">
	<jl-visually-hidden><h2 id="profile-companies">{t('profile.companies')}</h2></jl-visually-hidden>
	{#if companies.length}
		<Companies {companies} searchable={companies.length > 10} />
		{#if profile.self}<menu><a href="/add" data-add><Icon name="add" /> {t('form.company.title')}</a></menu>{/if}
	{:else if profile.self}
		<Empty text={t('me.companies.empty')}><a href="/add" data-add="main"><Icon name="add" /> {t('form.company.title')}</a></Empty>
	{:else}
		<Empty text={t('profile.empty')} />
	{/if}
</section>
