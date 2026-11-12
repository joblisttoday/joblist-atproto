<script>
	import { goto } from '$app/navigation';
	import config from '#lib/data/config.json';
	import Icon from '#lib/components/Icon.svelte';
	import MenuLinks from '#lib/components/MenuLinks.svelte';
	import MyJobPosts from '#lib/components/MyJobPosts.svelte';
	import SignIn from '#lib/components/SignIn.svelte';
	import { session, signOut } from '#lib/auth/session.svelte.js';
	import { ownDomain } from '#lib/models/company.js';
	import { data } from '#lib/network/network.svelte.js';
	import { outbox } from '#lib/network/outbox.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * For organizations, the one place: signed out, how an organization describes itself and
	 * posts its jobs (its domain as its Bluesky handle, then sign in); signed in with its
	 * domain, its page, its description, its job offers, its jobs on its own website.
	 * Job seekers never need to sign in: what they keep stays in their browser.
	 */
	const own = $derived(ownDomain(session.handle));
	const company = $derived(own ? data.companies.get(own) : undefined);
	const posts = $derived(session.did ? data.posts.filter((p) => p.did === session.did) : []);
	const waiting = $derived(outbox.entries.filter((e) => e.did === session.did).length);

	async function out() {
		await signOut();
		await goto('/organization');
	}

	/** @type {import('#lib/navigation/nav.js').MenuLink[]} */
	const manage = $derived([
		{ href: `/${own}`, icon: /** @type {const} */ ('companies'), label: t('orgs.page'), value: own },
		{ href: '/add', icon: /** @type {const} */ ('edit'), label: company ? t('orgs.describe.edit') : t('orgs.describe') },
		{ href: '/jobs/new', icon: /** @type {const} */ ('post'), label: t('post.title') },
		{ href: `/${own}#company-embed`, icon: /** @type {const} */ ('embed'), label: t('embed.section') },
		...(waiting ? [{ href: '/menu/outbox', icon: /** @type {const} */ ('suggestions'), label: t('outbox.title'), value: String(waiting) }] : []),
		{ onclick: out, icon: /** @type {const} */ ('signout'), label: t('me.signout') }
	]);
</script>

<svelte:head><title>{company?.name || t('orgs.title')} · {config.name}</title></svelte:head>

<jl-organization>
	{#if own}
		<h1>{company?.name || own}</h1>
		<p>{t('orgs.signedIn', { handle: own })}</p>
		<MenuLinks label={t('orgs.manage')} items={manage} />
		{#if posts.length}
			<section aria-labelledby="org-posts">
				<h2 id="org-posts">{t('orgs.posts')}</h2>
				<MyJobPosts {posts} />
			</section>
		{/if}
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
</jl-organization>

<style>
	jl-organization {
		display: block;
		max-width: var(--reading-width);
		margin-inline: auto;
		padding-bottom: var(--space-xl);
	}
	ol {
		padding-inline-start: var(--space-l);
		list-style: decimal;
	}
	li + li {
		margin-top: var(--space-xs);
	}
	section {
		margin-top: var(--space-l);
	}
</style>
