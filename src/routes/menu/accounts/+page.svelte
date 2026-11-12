<script>
	import config from '#lib/data/config.json';
	import Icon from '#lib/components/Icon.svelte';
	import { accounts } from '#lib/auth/accounts.js';
	import { session, signOutOf, switchAccount, switchToDevice } from '#lib/auth/session.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Who you are here, as in enform: this device (private, no account: what you follow and
	 * save), or one of the accounts signed in on this browser (an organization publishing).
	 * Each to use, or to sign out of; another to add.
	 */
	let list = $state(accounts().list);

	/** @param {string} did */
	async function out(did) {
		await signOutOf(did);
		list = accounts().list;
	}
</script>

<svelte:head><title>{t('accounts.title')} · {config.name}</title></svelte:head>

<jl-accounts>
	<h1>{t('accounts.title')}</h1>
	<ul>
		<li data-current={!session.did || undefined}>
			<Icon name="me" />
			<span><strong>{t('accounts.device')}</strong><small>{t('accounts.device.help')}</small></span>
			{#if session.did}<button type="button" onclick={switchToDevice}>{t('accounts.use')}</button>{:else}<small>{t('accounts.current')}</small>{/if}
		</li>
		{#each list as account (account.did)}
			{@const current = account.did === session.did}
			<li data-current={current || undefined}>
				{#if current && session.avatar}<img src={session.avatar} alt="" />{:else}<Icon name="companies" />{/if}
				<span><strong>@{account.handle || account.did}</strong>{#if current}<small>{t('accounts.current')}</small>{/if}</span>
				<menu>
					{#if !current}<button type="button" onclick={() => switchAccount(account.did)}>{t('accounts.use')}</button>{/if}
					<button type="button" onclick={() => out(account.did)}><Icon name="signout" /> {t('me.signout')}</button>
				</menu>
			</li>
		{/each}
	</ul>
	<menu><a href="/signin?add&next=/menu/accounts"><Icon name="add" /> {t('accounts.add')}</a></menu>
</jl-accounts>

<style>
	jl-accounts {
		display: block;
		max-width: var(--reading-width);
		margin-inline: auto;
		padding-bottom: var(--space-xl);
	}
	ul {
		margin: var(--space-m) 0;
		padding: 0;
		list-style: none;
		border: var(--border);
		border-radius: var(--radius);
	}
	li {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-s);
		padding: var(--space-s) var(--space-m);
	}
	li + li {
		border-top: var(--border);
	}
	li[data-current] {
		background: var(--color-soft);
	}
	li > span {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 0;
	}
	li small {
		color: var(--color-muted);
	}
	img {
		width: var(--avatar-small);
		height: var(--avatar-small);
		border-radius: var(--radius-round);
		object-fit: cover;
	}
	li menu {
		gap: var(--space-xs);
	}
</style>
