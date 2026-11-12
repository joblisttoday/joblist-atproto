<script>
	import Icon from './Icon.svelte';
	import config from '#lib/data/config.json';
	import CompanySave from './CompanySave.svelte';
	import PageMenu from './PageMenu.svelte';
	import { data } from '#lib/network/network.svelte.js';
	import { boardUrl } from '#lib/models/company.js';
	import { accountOf } from '#lib/network/accounts.svelte.js';
	import { forget, isKeptLink, keep } from '#lib/network/kept.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * An organization's careers page, its head: its name (✓ when it publishes it itself), Follow,
	 * one line of links (website, Bluesky, job board), its description, its places and tags.
	 * local: one only this browser knows (CompanyPage): the link it is kept by, the Bluesky
	 * account found for it.
	 * @type {{company: import('#lib/models/company.js').Company, local?: import('#lib/models/kept.js').Local, places?: string[]}}
	 */
	let { company, local, places = [] } = $props();
	const board = $derived(boardUrl(company.jobBoard));
	// The company's own account (it wrote the version shown, or its domain is its handle): its Bluesky picture and profile.
	const author = $derived(company.verified ? data.profiles.get(company.record.did) : undefined);
	const bluesky = $derived(accountOf(company.key));
	let unfolded = $state(false);
	let followed = $state(false);
	const account = $derived(
		local ? local.account : author || bluesky ? { handle: author?.handle || company.key, avatar: author?.avatar || bluesky?.avatar } : undefined
	);
	const short = (/** @type {string} */ link) => link.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
	const kept = $derived(local ? isKeptLink(local.link) : false);
	const about = $derived([...(company.kind ? [t(`kind.${company.kind}`)] : []), ...places, ...company.tags]);
</script>

<jl-company-header>
	<header>
		<jl-company-title>
			<h1>
				{#if account?.avatar}<img src={account.avatar} alt="" />{/if}{company.name}
				{#if company.verified}<span title={t('company.verified', { domain: company.key })}><Icon name="verified" /><jl-visually-hidden>{t('company.verified', { domain: company.key })}</jl-visually-hidden></span>{/if}
			</h1>
			{#if local}
				<button type="button" aria-pressed={kept ? 'true' : 'false'} onclick={() => (kept ? forget(local.link) : (keep(local.link, company.name, company.jobBoard), (followed = true)))} title={t('collections.private')}>
					<Icon name={kept ? 'savedOn' : 'save'} /> {t(kept ? 'follow.done' : 'follow.do')}
				</button>
			{:else}
				<CompanySave {company} onfollow={() => (followed = true)} />
			{/if}
			<PageMenu own={[]} />
		</jl-company-title>
		<p>
			<small>
				{#if local}<a href={local.link} target="_blank" rel="noopener noreferrer">{short(local.link)} <Icon name="external" /></a>
				{:else if company.url}<a href={company.url} target="_blank" rel="noopener">{company.key} <Icon name="external" /></a>{:else}{company.key}{/if}
				{#if account}· <a href={config.links.profile.replace('{handle}', account.handle)} target="_blank" rel="noopener">Bluesky <Icon name="external" /></a>{/if}
				{#if board}· <a href={board} target="_blank" rel="noopener noreferrer">{t('company.jobBoard')} <Icon name="external" /></a>{/if}
			</small>
		</p>
		{#if company.description}
			<!-- Long, it folds: the jobs come right after, on a phone too. -->
			{@const long = company.description.length > config.companyForm.foldAt}
			<jl-company-about folded={(long && !unfolded) || undefined}>
				<p>{company.description}</p>
				{#if long}<button type="button" aria-expanded={unfolded} onclick={() => (unfolded = !unfolded)}>{t(unfolded ? 'company.less' : 'company.more')}</button>{/if}
			</jl-company-about>
		{/if}
		{#if about.length}<p data-about><small>{about.join(' · ')}</small></p>{/if}
		{#if followed}
			<!-- Just followed: where its jobs are now. -->
			<p role="status" data-followed><Icon name="added" /> {t('follow.started', { name: company.name })} <a href="/">{t('nav.jobs')} <Icon name="next" /></a></p>
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
		grid-template-columns: minmax(0, 1fr) auto auto;
		align-items: center;
		gap: var(--space-s);
		margin: var(--space-m) 0 var(--space-xs);
	}
	h1 {
		display: flex;
		align-items: center;
		gap: var(--space-s);
		margin: 0;
		min-width: 0;
	}
	h1 img {
		width: var(--avatar-small);
		height: var(--avatar-small);
		border-radius: var(--radius);
		object-fit: cover;
	}
	h1 span {
		display: inline-flex;
		color: var(--color-ok);
		font-size: var(--font-size-small);
	}
	jl-company-title > button {
		font-size: var(--font-size-small);
	}
	jl-company-title > button[aria-pressed='true'] {
		background: var(--color-soft);
		color: var(--color-ok);
	}
	[data-about] {
		color: var(--color-muted);
	}
	[data-followed] {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-xs);
		padding: var(--space-xs) var(--space-m);
		border-radius: var(--radius);
		background: var(--color-soft);
		color: var(--color-ok);
		font-size: var(--font-size-small);
	}
</style>
