<script>
	import config from '#lib/data/config.json';
	import CardMenu from '#lib/components/CardMenu.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import Row from '#lib/components/Row.svelte';
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
	<jl-rows>
		<Row
			title={t('accounts.device')}
			icon="me"
			meta={[t('accounts.device.help')]}
			chip={session.did ? null : { text: t('accounts.current'), tone: 'ok' }}
			onclick={session.did ? switchToDevice : undefined}
		/>
		{#each list as account (account.did)}
			{@const current = account.did === session.did}
			{@const handle = account.handle || account.did}
			<Row
				title={`@${handle}`}
				avatar={{ key: handle, name: handle, src: current && session.avatar ? session.avatar : '' }}
				chip={current ? { text: t('accounts.current'), tone: 'ok' } : null}
			>
				{#snippet menu()}
					<CardMenu label={t('card.actions', { name: handle })}>
						{#snippet items(done)}
							{#if !current}<li><button type="button" onclick={() => (switchAccount(account.did), done())}><Icon name="me" /> {t('accounts.use')}</button></li>{/if}
							<li><button type="button" onclick={() => (out(account.did), done())}><Icon name="signout" /> {t('me.signout')}</button></li>
						{/snippet}
					</CardMenu>
				{/snippet}
			</Row>
		{/each}
	</jl-rows>
	<menu><a href="/signin?add&next=/menu/accounts"><Icon name="add" /> {t('accounts.add')}</a></menu>
</jl-accounts>

<style>
	jl-accounts {
		display: block;
		max-width: var(--reading-width);
		margin-inline: auto;
		padding-bottom: var(--space-xl);
	}
	jl-rows {
		display: block;
		margin: var(--space-m) 0;
	}
</style>
