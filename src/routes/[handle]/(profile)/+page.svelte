<script>
	import Icon from '#lib/components/Icon.svelte';
	import config from '#lib/data/config.json';
	import Empty from '#lib/components/Empty.svelte';
	import ListItem from '#lib/components/ListItem.svelte';
	import { getProfile, listsBy } from '#lib/network/profile.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	// An account's first tab: its lists, the most useful first.
	const profile = getProfile();
	const lists = $derived(profile.did ? listsBy(profile.did) : []);
</script>

<svelte:head><title>@{profile.handle} · {config.name}</title></svelte:head>

<section aria-labelledby="profile-lists">
	<jl-visually-hidden><h2 id="profile-lists">{t('profile.lists')}</h2></jl-visually-hidden>
	{#if lists.length}
		<ul>{#each lists as list (list.uri)}<li><ListItem {list} author={false} /></li>{/each}</ul>
		{#if profile.self}<menu><a href="/lists/new" data-add><Icon name="add" /> {t('list.new')}</a></menu>{/if}
	{:else if profile.self}
		<Empty text={t('me.lists.empty')}><a href="/lists/new" data-add="main"><Icon name="add" /> {t('list.new')}</a></Empty>
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
</style>
