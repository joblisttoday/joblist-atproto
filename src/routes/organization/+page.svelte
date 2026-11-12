<script>
	import { goto } from '$app/navigation';
	import config from '#lib/data/config.json';
	import providers from '#lib/data/providers.json';
	import Icon from '#lib/components/Icon.svelte';
	import MenuLinks from '#lib/components/MenuLinks.svelte';
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
	const fields = 4;
	let copied = $state(false);

	async function copy() {
		try {
			await navigator.clipboard.writeText(`${config.url}/${org.own}`);
			copied = true;
			setTimeout(() => (copied = false), config.layout.copiedMs);
		} catch {
			// the link is on its page, to copy from there
		}
	}

	async function out() {
		await signOut();
		await goto('/organization');
	}

	/** @type {import('#lib/navigation/nav.js').MenuLink[]} */
	const rows = $derived([
		{
			href: '/organization/page',
			icon: /** @type {const} */ ('edit'),
			label: t('orgs.page'),
			value: org.company ? t('orgs.page.done', { done: fields - org.missing.length, all: fields }) : t('orgs.page.none')
		},
		{
			href: '/organization/jobs',
			icon: /** @type {const} */ ('jobs'),
			label: t('orgs.posts'),
			value: org.board ? providers.find((p) => p.id === org.board?.provider)?.name || org.board.provider : org.posts.length ? String(org.posts.length) : ''
		},
		{ href: '/organization/embed', icon: /** @type {const} */ ('embed'), label: t('embed.section') },
		{ onclick: copy, icon: /** @type {const} */ ('copy'), label: copied ? t('apps.copied') : t('orgs.copyLink') },
		...(org.waiting ? [{ href: '/menu/outbox', icon: /** @type {const} */ ('suggestions'), label: t('outbox.title'), value: String(org.waiting) }] : []),
		{ onclick: out, icon: /** @type {const} */ ('signout'), label: t('me.signout') }
	]);
</script>

<svelte:head><title>{org.company?.name || t('orgs.title')} · {config.name}</title></svelte:head>

{#if org.own}
	<header>
		<h1>{org.company?.name || org.own}</h1>
		<a href="/{org.own}">{t('orgs.view')} <Icon name="next" /></a>
	</header>
	<p><small>{t('orgs.signedIn', { handle: org.own })}</small></p>
	<MenuLinks label={t('orgs.manage')} items={rows} hidden />
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
	header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-m);
	}
	ol {
		padding-inline-start: var(--space-l);
		list-style: decimal;
	}
	li + li {
		margin-top: var(--space-xs);
	}
</style>
