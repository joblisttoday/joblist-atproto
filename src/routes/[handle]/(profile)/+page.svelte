<script>
	import Icon from '#lib/components/Icon.svelte';
	import config from '#lib/data/config.json';
	import Companies from '#lib/components/Companies.svelte';
	import CompanyMap from '#lib/components/CompanyMap.svelte';
	import Empty from '#lib/components/Empty.svelte';
	import ViewSwitch from '#lib/components/ViewSwitch.svelte';
	import { mapPoints } from '#lib/models/company.js';
	import { pageView } from '#lib/navigation/page-view.svelte.js';
	import { companiesBy, getProfile } from '#lib/network/profile.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	// The organizations an account described (any version of theirs): as a list, a grid or on the map.
	const profile = getProfile();
	const companies = $derived(profile.did ? companiesBy(profile.did) : []);
	const shown = pageView('companies');
	const mapless = $derived(!companies.some((c) => mapPoints(c).length));
</script>

<svelte:head><title>@{profile.handle} · {config.name}</title></svelte:head>

<section aria-labelledby="profile-companies">
	<jl-visually-hidden><h2 id="profile-companies">{t('profile.companies')}</h2></jl-visually-hidden>
	{#if companies.length}
		<menu data-views><ViewSwitch bind:view={shown.view} page="companies" {mapless} /></menu>
		{#if shown.view === 'map' && !mapless}
			<jl-profile-map><CompanyMap {companies} full /></jl-profile-map>
		{:else}
			<Companies {companies} searchable={companies.length > 10} layout={shown.view === 'list' ? 'list' : 'grid'} />
		{/if}
		{#if profile.self}<menu><a href="/add" data-add><Icon name="add" /> {t('form.company.title')}</a></menu>{/if}
	{:else if profile.self}
		<Empty text={t('me.companies.empty')}><a href="/add" data-add="main"><Icon name="add" /> {t('form.company.title')}</a></Empty>
	{:else}
		<Empty text={t('profile.empty')} />
	{/if}
</section>

<style>
	menu[data-views] {
		justify-content: flex-end;
	}
	jl-profile-map {
		display: block;
		height: var(--map-height);
	}
</style>
