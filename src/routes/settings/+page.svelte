<script>
	import { goto } from '$app/navigation';
	import config from '#lib/data/config.json';
	import CollectionsTransfer from '#lib/components/CollectionsTransfer.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import LocaleSwitch from '#lib/components/LocaleSwitch.svelte';
	import PageHeader from '#lib/components/PageHeader.svelte';
	import ProfileSwitch from '#lib/components/ProfileSwitch.svelte';
	import { session, signOut } from '#lib/auth/session.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * How the app works in this browser, signed in or not: the account, the language,
	 * the profiles, and moving saved jobs to another device. One section after the other
	 * on phones; as many columns as fit on wide screens.
	 */
	async function out() {
		await signOut();
		await goto('/');
	}
</script>

<svelte:head><title>{t('settings.title')} · {config.name}</title></svelte:head>

<PageHeader title={t('settings.title')} intro={t('settings.intro')} />

<jl-settings>
	<section aria-labelledby="settings-account">
		<h2 id="settings-account">{t('settings.account')}</h2>
		{#if session.handle}
			<p>{t('settings.signedIn', { handle: session.handle })}</p>
			<menu>
				<li><a href="/{session.handle}"><Icon name="me" /> {t('settings.profile')}</a></li>
				<li><button type="button" onclick={out}>{t('me.signout')}</button></li>
			</menu>
		{:else}
			<p>{t('settings.signedOut')}</p>
			<menu><li><a href="/signin"><Icon name="signin" /> {t('nav.signin')}</a></li></menu>
		{/if}
	</section>

	<!-- Each names itself: no heading of their own. -->
	<section aria-labelledby="settings-browser">
		<h2 id="settings-browser">{t('settings.browser')}</h2>
		<LocaleSwitch />
		<ProfileSwitch />
	</section>

	<section aria-labelledby="settings-transfer">
		<h2 id="settings-transfer">{t('collections.transfer')}</h2>
		<CollectionsTransfer />
	</section>
</jl-settings>

<style>
	/* Phones: full-width sections, one rule between each. Wide screens: as many columns as fit. */
	jl-settings {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, var(--section-min)), 1fr));
		column-gap: var(--column-gap);
		align-items: start;
	}
	section {
		padding-block: var(--space-s) var(--space-m);
		border-top: var(--border);
	}
	h2 {
		margin-top: var(--space-s);
	}
	menu {
		margin-bottom: 0;
	}
</style>
