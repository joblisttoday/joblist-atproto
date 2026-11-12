<script>
	import { goto } from '$app/navigation';
	import config from '#lib/data/config.json';
	import providers from '#lib/data/providers.json';
	import Embed from '#lib/components/Embed.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import CompanyDelete from '#lib/components/CompanyDelete.svelte';
	import MyJobPosts from '#lib/components/MyJobPosts.svelte';
	import SignIn from '#lib/components/SignIn.svelte';
	import { checkBoard } from '#lib/ats/board-check.js';
	import { session, signOut } from '#lib/auth/session.svelte.js';
	import { ATPROTO, ownDomain } from '#lib/models/company.js';
	import { missingFields } from '#lib/models/company-form.js';
	import { data } from '#lib/network/network.svelte.js';
	import { outbox } from '#lib/network/outbox.svelte.js';
	import { formatNumber, t } from '#lib/i18n/index.svelte.js';

	/**
	 * For organizations: joblist is their careers page on the open network. Signed out, how to
	 * publish it (the domain as Bluesky handle, sign in). Signed in with the domain, its
	 * dashboard: is the page complete, where its jobs come from (its board, read live now, or
	 * posted here), its job offers, its jobs on its own website, its link. No visitor counts:
	 * joblist tracks no one. Job seekers never sign in: what they keep stays in their browser.
	 */
	const own = $derived(ownDomain(session.handle));
	const company = $derived(own ? data.companies.get(own) : undefined);
	const posts = $derived(session.did ? data.posts.filter((p) => p.did === session.did) : []);
	const waiting = $derived(outbox.entries.filter((e) => e.did === session.did).length);
	const missing = $derived(company ? missingFields(company) : []);
	const board = $derived(company?.jobBoard?.provider && company.jobBoard.id ? { provider: company.jobBoard.provider, id: company.jobBoard.id } : null);
	const read = $derived(board ? checkBoard(board) : null);
	const provider = $derived(board ? providers.find((p) => p.id === board.provider)?.name || board.provider : '');
	const link = $derived(`${config.url}/${own}`);
	const fields = /** @type {const} */ (['description', 'jobBoard', 'locations', 'tags']);
	let copied = $state(false);

	async function copy() {
		try {
			await navigator.clipboard.writeText(link);
			copied = true;
			setTimeout(() => (copied = false), config.layout.copiedMs);
		} catch {
			// the link stays shown, to copy by hand
		}
	}

	async function out() {
		await signOut();
		await goto('/organization');
	}
</script>

<svelte:head><title>{company?.name || t('orgs.title')} · {config.name}</title></svelte:head>

<jl-organization>
	{#if own}
		<header>
			<h1>{company?.name || own}</h1>
			<a href="/{own}">{t('orgs.view')} <Icon name="next" /></a>
		</header>

		<section aria-labelledby="org-page">
			<h2 id="org-page">{t('orgs.page')}</h2>
			{#if company}
				<ul data-checks>
					{#each fields as field (field)}
						<li data-done={!missing.includes(field) || undefined}>
							<Icon name={missing.includes(field) ? 'add' : 'added'} />
							<a href="/add?key={encodeURIComponent(own)}&field={field}">{t(`orgs.field.${field}`)}</a>
						</li>
					{/each}
				</ul>
				<menu><a href="/add">{t('orgs.describe.edit')}</a></menu>
			{:else}
				<p>{t('orgs.none')}</p>
				<menu><a href="/add" data-primary><Icon name="add" /> {t('orgs.describe')}</a></menu>
			{/if}
		</section>

		<section aria-labelledby="org-jobs">
			<h2 id="org-jobs">{t('orgs.posts')}</h2>
			{#if board}
				<p>
					{t('orgs.from.board', { provider, id: board.id })}
					{#await read then found}· {found ? t('orgs.from.read', { count: formatNumber(found.count) }) : t('orgs.from.unread')}{/await}
				</p>
			{:else if company?.jobBoard?.provider === ATPROTO || posts.length}
				<p>{t('orgs.from.here')}</p>
			{/if}
			{#if posts.length}<MyJobPosts {posts} />{/if}
			<menu><a href="/jobs/new" data-primary><Icon name="add" /> {t('post.title')}</a></menu>
		</section>

		{#if board && company}
			<section aria-labelledby="org-embed">
				<h2 id="org-embed">{t('embed.section')}</h2>
				<Embed attribute="board" value="{board.provider}:{board.id}" title={t('embed.title', { name: company.name })} />
			</section>
		{/if}

		<section aria-labelledby="org-share">
			<h2 id="org-share">{t('orgs.share')}</h2>
			<p><code>{link}</code> <button type="button" onclick={copy}><Icon name="copy" /> {copied ? t('apps.copied') : t('apps.copy')}</button></p>
		</section>

		<footer>
			<p><small>{t('orgs.signedIn', { handle: own })}</small></p>
			<menu>
				{#if waiting}<a href="/menu/outbox">{t('outbox.title')} ({waiting})</a>{/if}
				<button type="button" onclick={out}><Icon name="signout" /> {t('me.signout')}</button>
				{#if company}<CompanyDelete {company} />{/if}
			</menu>
		</footer>
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
	header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-m);
	}
	section {
		margin-top: var(--space-l);
		padding-top: var(--space-m);
		border-top: var(--border);
	}
	h2 {
		margin: 0 0 var(--space-s);
		font-size: var(--font-size-base);
	}
	[data-checks] {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-xs) var(--space-m);
		padding: 0;
		list-style: none;
	}
	[data-checks] li {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
		color: var(--color-muted);
	}
	[data-checks] li[data-done] {
		color: var(--color-ok);
	}
	[data-primary] {
		background: var(--color-accent);
		color: var(--color-accent-fg);
		border-color: var(--color-accent);
	}
	code {
		word-break: break-all;
	}
	footer {
		margin-top: var(--space-xl);
		padding-top: var(--space-m);
		border-top: var(--border);
	}
	ol {
		padding-inline-start: var(--space-l);
		list-style: decimal;
	}
	li + li {
		margin-top: var(--space-xs);
	}
</style>
