<script>
	import config from '#lib/data/config.json';
	import { session } from '#lib/auth/session.svelte.js';
	import { accountOf } from '#lib/network/accounts.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * For the company itself: how to show its page as its own (its Bluesky handle is
	 * its domain), or, signed in with that handle, what it can do here.
	 * @type {{company: import('#lib/models/company.js').Company}}
	 */
	let { company } = $props();
	const manager = $derived(session.handle === company.key);
	const post = $derived(`/jobs/new?company=${encodeURIComponent(company.key)}`);
	const edit = $derived(`/add?key=${encodeURIComponent(company.key)}`);
	// Its domain is already its Bluesky handle: signing in with it is the only step left.
	const onBluesky = $derived(Boolean(accountOf(company.key)));
	const signin = $derived(`/signin?handle=${encodeURIComponent(company.key)}&next=${encodeURIComponent(`/company/${company.key}`)}`);
</script>

{#if manager}
	<jl-company-claim manager>
		<p>
			<strong>{t('company.manage.title')}</strong>
			{company.verified ? t('company.manage.text') : t('company.manage.first')}
		</p>
		<menu>
			<a href={post}>{t('post.title')}</a>
			<a href={edit}>{t(company.verified ? 'company.edit' : 'company.manage.publish')}</a>
		</menu>
	</jl-company-claim>
{:else if !company.verified}
	<jl-company-claim>
		<details>
			<summary>{t('company.claim.title')}</summary>
			<p>{t('company.claim.text')}</p>
			{#if onBluesky}
				<p>{t('company.claim.ready', { domain: company.key })}</p>
				<menu><a href={signin}>{t('company.claim.signinAs', { domain: company.key })}</a></menu>
			{:else}
			<ol>
				<li>{t('company.claim.handle', { domain: company.key })} <a href={config.links.handleHelp} target="_blank" rel="noopener">{t('company.claim.how')}</a></li>
				<li>{t('company.claim.signin', { domain: company.key })}</li>
				<li>{t('company.claim.edit')}</li>
			</ol>
			{/if}
		</details>
	</jl-company-claim>
{/if}

<style>
	jl-company-claim {
		display: block;
		margin: var(--space-m) 0;
		padding: var(--space-s) var(--space-m);
		border: var(--border);
		border-radius: var(--radius);
	}
	jl-company-claim[manager] {
		border-color: var(--color-ok);
	}
	summary {
		cursor: pointer;
		font-weight: var(--font-weight-strong);
		min-height: var(--tap-size);
		display: flex;
		align-items: center;
	}
	p,
	ol {
		margin: var(--space-xs) 0;
	}
	ol {
		list-style: decimal;
		padding-inline-start: var(--space-l);
	}
	li + li {
		margin-top: var(--space-xs);
	}
	menu {
		margin: var(--space-s) 0 var(--space-xs);
	}
	menu > a:first-child {
		background: var(--color-accent);
		color: var(--color-accent-fg);
		border-color: var(--color-accent);
	}
</style>
