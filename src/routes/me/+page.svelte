<script>
	import { goto } from '$app/navigation';
	import config from '#lib/data/config.json';
	import Companies from '#lib/components/Companies.svelte';
	import ListItem from '#lib/components/ListItem.svelte';
	import RequireSession from '#lib/components/RequireSession.svelte';
	import { session, signOut } from '#lib/auth/session.svelte.js';
	import { data } from '#lib/network/network.svelte.js';
	import { i18n, setLocale, t } from '#lib/i18n/index.svelte.js';

	const lists = $derived(data.lists.filter((l) => l.did === session.did));
	const companies = $derived(
		[...data.companies.values()].filter((c) => c.versions.some((v) => v.did === session.did))
	);

	async function out() {
		await signOut();
		await goto('/');
	}
</script>

<RequireSession>
	<header>
		<p><small>{t('me.title')}</small></p>
		<h1><a href="/{session.handle}">@{session.handle}</a></h1>
		<menu><button type="button" onclick={out}>{t('me.signout')}</button></menu>
	</header>

	<section>
		<h2>{t('me.lists')}</h2>
		<ul>{#each lists as list (list.uri)}<li><ListItem {list} /></li>{/each}</ul>
		<p><a href="/lists/new">+ {t('list.new')}</a></p>
	</section>

	<section>
		<h2>{t('me.companies')}</h2>
		<Companies {companies} searchable={companies.length > 10} />
		<p><a href="/add">+ {t('form.company.title')}</a></p>
	</section>
</RequireSession>

<section>
	<label for="locale">{t('me.language')}</label>
	<select id="locale" value={i18n.locale} onchange={(e) => setLocale(e.currentTarget.value)}>
		{#each config.locales as locale (locale)}<option value={locale}>{locale}</option>{/each}
	</select>
	<p>
		<small>{t('about.data')} <a href={config.source}>{t('about.source')}</a></small>
	</p>
</section>
