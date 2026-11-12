<script>
	import { goto } from '$app/navigation';
	import config from '#lib/data/config.json';
	import Icon from '#lib/components/Icon.svelte';
	import OrganizationHome from '#lib/components/OrganizationHome.svelte';
	import SignIn from '#lib/components/SignIn.svelte';
	import { session, signOut } from '#lib/auth/session.svelte.js';
	import { ownOrganization as org } from '#lib/network/own-organization.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * For organizations: joblist is their careers page on the open network. Signed out, how to
	 * publish it (the domain as Bluesky handle, sign in). Signed in with the domain, its
	 * dashboard: a few rows, each its own page (its description, its job offers, its jobs on
	 * its website), its link to copy, and signing out. No visitor counts: joblist tracks no one.
	 */
	async function out() {
		await signOut();
		await goto('/organization');
	}

</script>

<svelte:head><title>{org.company?.name || t('orgs.title')} · {config.name}</title></svelte:head>

{#if org.own}
	<OrganizationHome />
{:else}
	<h1>{t('orgs.title')}</h1>
	<p>{t('orgs.intro')}</p>
	<ol>
		<li>{t('orgs.step.handle')} <a href={config.links.handleHelp} target="_blank" rel="noopener">{t('company.claim.how')}</a></li>
		<li>{t('orgs.step.signin')}</li>
		<li>{t('orgs.step.describe')}</li>
	</ol>
	{#if session.handle}
		<p role="status">{t('orgs.notOrg', { handle: session.handle })}</p>
		<menu><button type="button" onclick={out}><Icon name="signout" /> {t('me.signout')}</button></menu>
	{:else}
		<SignIn />
	{/if}
{/if}

<style>
	ol {
		padding-inline-start: var(--space-l);
		list-style: decimal;
	}
	li + li {
		margin-top: var(--space-xs);
	}
</style>
