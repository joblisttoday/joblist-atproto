<script>
	import { outbox } from '#lib/network/outbox.svelte.js';
	import { session } from '#lib/auth/session.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Says, only when it matters, that the app works from what it kept: offline, changes
	 * waiting to reach the person's server, or refused by it (to see in Settings).
	 */
	const mine = $derived(outbox.entries.filter((e) => e.did === session.did));
	const waiting = $derived(mine.filter((e) => !e.error).length);
	const refused = $derived(mine.length - waiting);
	const state = $derived(!outbox.online ? 'offline' : refused ? 'refused' : waiting ? 'waiting' : null);
</script>

{#if state}
	<jl-outbox-status {state} role="status">
		{#if !outbox.online}<span>{t('outbox.offline')}</span>{/if}
		{#if waiting}<span>{t(outbox.sending ? 'outbox.sending' : 'outbox.waiting', { count: waiting })}</span>{/if}
		{#if refused}<a href="/settings#settings-outbox">{t('outbox.refused', { count: refused })}</a>{/if}
	</jl-outbox-status>
{/if}

<style>
	jl-outbox-status {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0 var(--space-s);
		min-height: var(--tap-size);
		padding: var(--space-xs) var(--gutter);
		background: var(--color-soft);
		font-size: var(--font-size-small);
	}
	jl-outbox-status[state='refused'] a {
		color: var(--color-error);
	}
</style>
