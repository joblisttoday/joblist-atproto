<script>
	import { giveUp, outbox, sendOutbox } from '#lib/network/outbox.svelte.js';
	import { session } from '#lib/auth/session.svelte.js';
	import config from '#lib/data/config.json';
	import Empty from './Empty.svelte';
	import { i18n, t } from '#lib/i18n/index.svelte.js';

	/**
	 * The signed-in account's changes kept in this browser until its server takes them:
	 * what each is, when it was made, why it was refused; send them now, or give one up.
	 */
	const mine = $derived(outbox.entries.filter((e) => e.did === session.did));
	const types = /** @type {Record<string, string>} */ (Object.fromEntries(Object.entries(config.collections).map(([type, nsid]) => [nsid, type])));
	const when = (/** @type {string} */ at) => new Date(at).toLocaleString(i18n.locale, { dateStyle: 'medium', timeStyle: 'short' });
</script>

<jl-outbox-list>
	{#if mine.length}
		<ul>
			{#each mine as entry (entry.id)}
				<li>
					<span>
						<strong>{t(`outbox.${types[entry.collection] || 'record'}`)}{#if entry.record?.name}: {entry.record.name}{/if}</strong>
						<small>{t(entry.op === 'delete' ? 'outbox.op.delete' : 'outbox.op.save')} · <time datetime={entry.at}>{when(entry.at)}</time></small>
						{#if entry.error}<small role="alert">{t('outbox.refusedWhy', { reason: entry.error })}</small>{/if}
					</span>
					<button type="button" onclick={() => giveUp(entry.id)}>{t('outbox.giveUp')}</button>
				</li>
			{/each}
		</ul>
		{#if session.agent && mine.some((e) => !e.error)}
			<menu><li><button type="button" disabled={outbox.sending} onclick={sendOutbox}>{t('outbox.send')}</button></li></menu>
		{/if}
	{:else}
		<Empty text={t('outbox.empty')} />
	{/if}
</jl-outbox-list>

<style>
	jl-outbox-list {
		display: block;
	}
	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	li {
		display: flex;
		align-items: center;
		gap: var(--space-s);
		padding-block: var(--space-xs);
	}
	li + li {
		border-top: var(--border);
	}
	span {
		display: flex;
		flex-direction: column;
		flex: 1;
	}
	small[role='alert'] {
		color: var(--color-error);
	}
	button {
		min-height: var(--chip-height);
	}
</style>
