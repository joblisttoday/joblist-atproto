<script>
	import { goto } from '$app/navigation';
	import config from '#lib/data/config.json';
	import providers from '#lib/data/providers.json';
	import Icon from './Icon.svelte';
	import MenuLinks from './MenuLinks.svelte';
	import MyJobPosts from './MyJobPosts.svelte';
	import { signOut } from '#lib/auth/session.svelte.js';
	import { ownOrganization as org } from '#lib/network/own-organization.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * An organization's home, signed in with its domain (the home, and /organization): its job
	 * offers first, with Post a job; then its page, its jobs on its website, its link, signing
	 * out. No visitor counts: joblist tracks no one.
	 */
	const fields = 4;
	let copied = $state(false);
	const provider = $derived(org.board ? providers.find((p) => p.id === org.board?.provider)?.name || org.board.provider : '');

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
		await goto('/');
	}

	/** @type {import('#lib/navigation/nav.js').MenuLink[]} */
	const rows = $derived([
		{
			href: '/organization/page',
			icon: /** @type {const} */ ('edit'),
			label: t('orgs.page'),
			value: org.company ? t('orgs.page.done', { done: fields - org.missing.length, all: fields }) : t('orgs.page.none')
		},
		...(org.board ? [{ href: '/organization/jobs', icon: /** @type {const} */ ('jobs'), label: t('orgs.from.short'), value: provider }] : []),
		{ href: '/organization/embed', icon: /** @type {const} */ ('embed'), label: t('embed.section') },
		{ onclick: copy, icon: /** @type {const} */ ('copy'), label: copied ? t('apps.copied') : t('orgs.copyLink') },
		...(org.waiting ? [{ href: '/menu/outbox', icon: /** @type {const} */ ('suggestions'), label: t('outbox.title'), value: String(org.waiting) }] : []),
		{ onclick: out, icon: /** @type {const} */ ('signout'), label: t('me.signout') }
	]);
</script>

<jl-organization-home>
	<header>
		<h1>{org.company?.name || org.own}</h1>
		<a href="/{org.own}">{t('orgs.view')} <Icon name="next" /></a>
	</header>
	<p><small>{t('orgs.signedIn', { handle: org.own })}</small></p>

	<section aria-labelledby="org-offers">
		<h2 id="org-offers">{t('orgs.posts')}</h2>
		{#if org.posts.length}<MyJobPosts posts={org.posts} company={false} />{:else if org.board}<p><small>{t('orgs.from.board', { provider, id: org.board.id })}</small></p>{/if}
		<menu><a href="/jobs/new" data-primary><Icon name="add" /> {t('post.title')}</a></menu>
	</section>

	<MenuLinks label={t('orgs.manage')} items={rows} />
</jl-organization-home>

<style>
	jl-organization-home {
		display: block;
		max-width: var(--reading-width);
		margin-inline: auto;
	}
	header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-m);
	}
	header + p {
		margin-top: 0;
	}
	section {
		margin: var(--space-l) 0;
	}
	h2 {
		margin: 0 0 var(--space-xs);
		font-size: var(--font-size-base);
	}
	menu {
		margin-top: var(--space-s);
	}
	[data-primary] {
		background: var(--color-accent);
		color: var(--color-accent-fg);
		border-color: var(--color-accent);
	}
</style>
