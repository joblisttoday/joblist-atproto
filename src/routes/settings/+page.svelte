<script>
	import config from '#lib/data/config.json';
	import { session, signOut } from '#lib/session.svelte.js';
	import { i18n, setLocale, t } from '#lib/i18n/index.svelte.js';

	/** Settings (/settings): the language of this device, the account signed in here. */
	const id = $props.id();
</script>

<svelte:head><title>{t('nav.settings')} · {config.name}</title></svelte:head>

<h1>{t('nav.settings')}</h1>

<section aria-labelledby="{id}-language">
	<h2 id="{id}-language">{t('settings.language')}</h2>
	<select aria-labelledby="{id}-language" value={i18n.locale} onchange={(e) => setLocale(e.currentTarget.value)}>
		{#each config.locales as locale (locale)}<option value={locale}>{new Intl.DisplayNames([locale], { type: 'language' }).of(locale)}</option>{/each}
	</select>
</section>

<section aria-labelledby="{id}-account">
	<h2 id="{id}-account">{t('settings.account')}</h2>
	{#if !session.ready}
		<p><small>…</small></p>
	{:else if session.handle}
		<p>{t('signin.as', { handle: session.handle })}</p>
		<menu><button type="button" onclick={signOut}>{t('signin.out')}</button></menu>
	{:else}
		<menu><a href="/signin" data-primary>{t('signin.title')}</a></menu>
	{/if}
</section>

<style>
	select {
		width: auto;
	}
</style>
