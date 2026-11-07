<script>
	import Icon from './Icon.svelte';
	import config from '#lib/data/config.json';
	import CompanyDelete from './CompanyDelete.svelte';
	import CompanyEdited from './CompanyEdited.svelte';
	import CompanyInvite from './CompanyInvite.svelte';
	import { data } from '#lib/network/network.svelte.js';
	import { boardUrl } from '#lib/models/company.js';
	import { accountOf } from '#lib/network/accounts.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/** @type {{company: import('#lib/models/company.js').Company}} */
	let { company } = $props();
	const board = $derived(boardUrl(company.jobBoard));
	// The company's own account (it wrote the version shown, or its domain is its handle): its Bluesky picture and profile.
	const author = $derived(company.verified ? data.profiles.get(company.record.did) : undefined);
	const bluesky = $derived(accountOf(company.key));
	let unfolded = $state(false);
	const account = $derived(
		author || bluesky ? { handle: author?.handle || company.key, avatar: author?.avatar || bluesky?.avatar, followers: bluesky?.followers } : undefined
	);
</script>

<jl-company-header verified={company.verified || undefined}>
	<header>
		<h1>{#if account?.avatar}<img src={account.avatar} alt="" />{/if}{company.name}</h1>
		<p>
			<small>
				{#if company.url}<a href={company.url} target="_blank" rel="noopener">{company.key} <Icon name="external" /></a>{:else}{company.key}{/if}
				{#if company.verified}· <span><Icon name="verified" /> {t('company.verified', { domain: company.key })}</span>{/if}
				{#if account}
					· <a href={config.links.profile.replace('{handle}', account.handle)} target="_blank" rel="noopener">{t('company.onBluesky', { handle: account.handle })}</a>
					{#if account.followers}· {t('company.followers', { count: account.followers })}{/if}
				{/if}
			</small>
		</p>
		<CompanyEdited {company} />
		{#if company.description}
			<!-- Long, it folds: the jobs come right after the company, on a phone too. -->
			{@const long = company.description.length > config.companyForm.foldAt}
			<jl-company-about folded={(long && !unfolded) || undefined}>
				<p>{company.description}</p>
				{#if long}<button type="button" aria-expanded={unfolded} onclick={() => (unfolded = !unfolded)}>{t(unfolded ? 'company.less' : 'company.more')}</button>{/if}
			</jl-company-about>
		{/if}
		<CompanyInvite {company} field="description" />
		{#if company.tags.length}
			<ul aria-label={t('form.tags')}>
				{#each company.tags as tag (tag)}<li><a href="/companies#q={encodeURIComponent(tag)}">{tag}</a></li>{/each}
			</ul>
		{/if}
		<CompanyInvite {company} field="tags" />
		<menu>
			{#if board}<a href={board} target="_blank" rel="noopener">{t('company.jobBoard')} <Icon name="external" /></a>{/if}
			<a href="/add?key={encodeURIComponent(company.key)}">{t('company.edit')}</a>
			<CompanyDelete {company} />
		</menu>
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
	h1 {
		display: flex;
		align-items: center;
		gap: var(--space-s);
		margin-bottom: var(--space-xs);
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
</style>
