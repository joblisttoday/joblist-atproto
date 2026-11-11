<script>
	import Icon from './Icon.svelte';
	import config from '#lib/data/config.json';
	import CompanyDelete from './CompanyDelete.svelte';
	import CompanyInvite from './CompanyInvite.svelte';
	import CompanySave from './CompanySave.svelte';
	import PageMenu from './PageMenu.svelte';
	import { data } from '#lib/network/network.svelte.js';
	import { boardUrl } from '#lib/models/company.js';
	import { isCompanyKey } from '#lib/models/landing.js';
	import { accountOf } from '#lib/network/accounts.svelte.js';
	import { forget, isKeptLink, keep } from '#lib/network/kept.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * An organization's name, links, description and tags, and what can be done with it.
	 * local: one only this browser knows (CompanyPage): the link it is kept by, the Bluesky
	 * account found for it, Save in this browser and Suggest to joblist, instead of editing it.
	 * @type {{company: import('#lib/models/company.js').Company, local?: import('#lib/models/kept.js').Local}}
	 */
	let { company, local } = $props();
	const board = $derived(boardUrl(company.jobBoard));
	// The company's own account (it wrote the version shown, or its domain is its handle): its Bluesky picture and profile.
	const author = $derived(company.verified ? data.profiles.get(company.record.did) : undefined);
	const bluesky = $derived(accountOf(company.key));
	let unfolded = $state(false);
	const account = $derived(
		local
			? local.account
			: author || bluesky
				? { handle: author?.handle || company.key, avatar: author?.avatar || bluesky?.avatar, followers: bluesky?.followers }
				: undefined
	);
	const short = (/** @type {string} */ link) => link.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
	const kept = $derived(local ? isKeptLink(local.link) : false);
</script>

<jl-company-header verified={company.verified || undefined}>
	<header>
		<!-- Its menu at the right edge of its name, as on every page (PageHeader). -->
		<jl-company-title>
			<h1>{#if account?.avatar}<img src={account.avatar} alt="" />{/if}{company.name}</h1>
			<PageMenu
				feed={!local && isCompanyKey(company.key) ? { company: company.key } : null}
				own={local
					? []
					: [
							{ href: `/jobs/new?company=${encodeURIComponent(company.key)}`, label: 'menu.postHere', icon: 'post' },
							{ href: `/add?key=${encodeURIComponent(company.key)}`, label: 'company.edit', icon: 'edit' }
						]}
			/>
		</jl-company-title>
		<p>
			<small>
				{#if local}<a href={local.link} target="_blank" rel="noopener noreferrer">{short(local.link)} <Icon name="external" /></a>
				{:else if company.url}<a href={company.url} target="_blank" rel="noopener">{company.key} <Icon name="external" /></a>{:else}{company.key}{/if}
				{#if company.verified}· <span><Icon name="verified" /> {t('company.verified', { domain: company.key })}</span>{/if}
				{#if account}
					· <a href={config.links.profile.replace('{handle}', account.handle)} target="_blank" rel="noopener">{t('company.onBluesky', { handle: account.handle })}</a>
					{#if account.followers}· {t('company.followers', { count: account.followers })}{/if}
				{/if}
			</small>
		</p>
		{#if local}<p data-local><small>{t('org.intro')}</small></p>{/if}
		{#if company.description}
			<!-- Long, it folds: the jobs come right after the company, on a phone too. -->
			{@const long = company.description.length > config.companyForm.foldAt}
			<jl-company-about folded={(long && !unfolded) || undefined}>
				<p>{company.description}</p>
				{#if long}<button type="button" aria-expanded={unfolded} onclick={() => (unfolded = !unfolded)}>{t(unfolded ? 'company.less' : 'company.more')}</button>{/if}
			</jl-company-about>
		{/if}
		{#if !local}<CompanyInvite {company} field="description" />{/if}
		{#if company.tags.length || company.kind}
			<ul aria-label={t('form.tags')}>
				{#if company.kind}<li><a href="/companies#q={company.kind}" data-kind>{t(`kind.${company.kind}`)}</a></li>{/if}
				{#each company.tags as tag (tag)}<li><a href="/companies#q={encodeURIComponent(tag)}">{tag}</a></li>{/each}
			</ul>
		{/if}
		{#if local}
			<menu>
				<a href={local.suggest} data-primary><Icon name="add" /> {t('org.suggest')}</a>
				<button type="button" aria-pressed={kept ? 'true' : 'false'} onclick={() => (kept ? forget(local.link) : keep(local.link, company.name))} title={t('collections.private')}>
					<Icon name={kept ? 'savedOn' : 'save'} /> {t(kept ? 'collections.saved' : 'collections.save')}
				</button>
				{#if board}<a href={board} target="_blank" rel="noopener noreferrer">{t('company.jobBoard')} <Icon name="external" /></a>{/if}
			</menu>
		{:else}
			<CompanyInvite {company} field="tags" />
			<menu>
				<CompanySave {company} />
				{#if board}<a href={board} target="_blank" rel="noopener">{t('company.jobBoard')} <Icon name="external" /></a>{/if}
				<a href="/add?key={encodeURIComponent(company.key)}">{t('company.edit')}</a>
				<CompanyDelete {company} />
			</menu>
		{/if}
	</header>
</jl-company-header>

<style>
	jl-company-header {
		display: block;
	}
	jl-company-about {
		display: block;
	}
	jl-company-about[folded] p {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: var(--fold-lines);
		line-clamp: var(--fold-lines);
		overflow: hidden;
	}
	jl-company-about button {
		min-height: var(--chip-height);
		padding: 0;
		border: 0;
		background: none;
		text-decoration: underline;
		font-size: var(--font-size-small);
	}
	jl-company-title {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
		gap: var(--space-m);
		margin: var(--space-m) 0 var(--space-xs);
	}
	h1 {
		display: flex;
		align-items: center;
		gap: var(--space-s);
		margin: 0;
	}
	h1 img {
		width: var(--avatar-small);
		height: var(--avatar-small);
		border-radius: var(--radius);
		object-fit: cover;
	}
	span {
		color: var(--color-ok);
	}
	ul {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-xs);
		margin-bottom: var(--space-m);
	}
	ul a {
		display: inline-flex;
		align-items: center;
		min-height: var(--tap-size);
		padding: 0 var(--space-s);
		border-radius: var(--radius-round);
		background: var(--color-soft);
		font-size: var(--font-size-small);
		text-decoration: none;
	}
	menu > * {
		font-size: var(--font-size-small);
	}
	menu [data-primary] {
		background: var(--color-accent);
		color: var(--color-accent-fg);
		border-color: var(--color-accent);
	}
	menu button[aria-pressed='true'] {
		background: var(--color-soft);
		color: var(--color-ok);
	}
	[data-local] {
		margin-bottom: var(--space-s);
	}
</style>
