<script>
	import config from '#lib/data/config.json';
	import CompanyMap from '#lib/components/CompanyMap.svelte';
	import Empty from '#lib/components/Empty.svelte';
	import ListItem from '#lib/components/ListItem.svelte';
	import ViewSwitch from '#lib/components/ViewSwitch.svelte';
	import { pageView } from '#lib/navigation/page-view.svelte.js';
	import { data, membersOf } from '#lib/network/network.svelte.js';
	import { getProfile, listsBy } from '#lib/network/profile.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	// An account's first tab: its lists, the most useful first; on the map, their organizations.
	const profile = getProfile();
	const lists = $derived(profile.did ? listsBy(profile.did) : []);
	const shown = pageView('lists');
	const companies = $derived.by(() => {
		if (shown.view !== 'map') return [];
		const keys = new Set(lists.flatMap((l) => membersOf(l).members.map((m) => m.key)));
		return [...keys].map((key) => data.companies.get(key)).filter((c) => c !== undefined);
	});
</script>

<svelte:head><title>@{profile.handle} · {config.name}</title></svelte:head>

<section aria-labelledby="profile-lists" data-view={shown.view}>
	<jl-visually-hidden><h2 id="profile-lists">{t('profile.lists')}</h2></jl-visually-hidden>
	{#if lists.length}
		<menu data-views><ViewSwitch bind:view={shown.view} page="lists" /></menu>
		{#if shown.view === 'map'}
			<jl-profile-map><CompanyMap {companies} full /></jl-profile-map>
		{:else}
			<ul>{#each lists as list (list.uri)}<li><ListItem {list} author={false} /></li>{/each}</ul>
		{/if}
	{:else}
		<Empty text={t('profile.empty')} />
	{/if}
</section>

<style>
	/* Lists in as many columns as fit. */
	ul {
		display: grid;
		grid-template-columns: var(--columns);
		column-gap: var(--column-gap);
	}
	section[data-view='list'] ul {
		grid-template-columns: 1fr;
	}
	menu[data-views] {
		justify-content: flex-end;
	}
	jl-profile-map {
		display: block;
		height: var(--map-height);
	}
</style>
