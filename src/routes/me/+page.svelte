<script>
	import { goto } from '$app/navigation';
	import config from '#lib/data/config.json';
	import Companies from '#lib/components/Companies.svelte';
	import ListItem from '#lib/components/ListItem.svelte';
	import ProfileHeader from '#lib/components/ProfileHeader.svelte';
	import RequireSession from '#lib/components/RequireSession.svelte';
	import { session, signOut } from '#lib/auth/session.svelte.js';
	import { data } from '#lib/network/network.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	const lists = $derived(data.lists.filter((l) => l.did === session.did));
	const companies = $derived(
		[...data.companies.values()].filter((c) => c.versions.some((v) => v.did === session.did))
	);

	async function out() {
		await signOut();
		await goto('/');
	}
</script>

<svelte:head><title>{t('nav.me')} · {config.name}</title></svelte:head>

<RequireSession>
	<ProfileHeader did={session.did || undefined} handle={session.handle || ''}>
		<menu>
			<a href="/{session.handle}">{t('me.public')}</a>
			<button type="button" onclick={out}>{t('me.signout')}</button>
		</menu>
	</ProfileHeader>

	<section>
		<h2>{t('me.lists')}</h2>
		{#if lists.length}
			<ul>{#each lists as list (list.uri)}<li><ListItem {list} author={false} /></li>{/each}</ul>
		{:else}
			<p><small>{t('me.lists.empty')}</small></p>
		{/if}
		<menu><a href="/lists/new">+ {t('list.new')}</a></menu>
	</section>

	<section>
		<h2>{t('me.companies')}</h2>
		{#if companies.length}
			<Companies {companies} searchable={companies.length > 10} />
		{:else}
			<p><small>{t('me.companies.empty')}</small></p>
		{/if}
		<menu><a href="/add">+ {t('form.company.title')}</a></menu>
	</section>
</RequireSession>
