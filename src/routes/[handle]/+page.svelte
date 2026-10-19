<script>
	import { page } from '$app/state';
	import Companies from '#lib/components/Companies.svelte';
	import ListItem from '#lib/components/ListItem.svelte';
	import { resolveDid } from '#lib/atproto/identity.js';
	import { data } from '#lib/network/network.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	const handle = $derived(page.params.handle || '');
	const did = $derived(resolveDid(handle));
</script>

<h1>@{handle}</h1>
{#await did then did}
	{@const lists = data.lists.filter((l) => l.did === did)}
	{@const companies = [...data.companies.values()].filter((c) => c.versions.some((v) => v.did === did))}
	<section>
		<h2>{t('profile.lists')}</h2>
		{#if lists.length}
			<ul>{#each lists as list (list.uri)}<li><ListItem {list} /></li>{/each}</ul>
		{:else}
			<p><small>{t('profile.empty')}</small></p>
		{/if}
	</section>
	<section>
		<h2>{t('profile.companies')}</h2>
		{#if companies.length}
			<Companies {companies} searchable={companies.length > 10} />
		{:else}
			<p><small>{t('profile.empty')}</small></p>
		{/if}
	</section>
{:catch error}
	<p role="alert">{error.message}</p>
{/await}
