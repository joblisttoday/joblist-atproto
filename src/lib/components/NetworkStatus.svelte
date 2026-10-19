<script>
	import { data, network, refresh } from '#lib/network/network.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	// Nothing to show yet: the first visit, before anything is cached.
	const empty = $derived(!data.companies.size && !data.lists.length);
	const counts = $derived(t('network.counts', { companies: data.companies.size, lists: data.lists.length }));
</script>

<jl-network-status loading={network.loading || undefined} empty={empty || undefined} aria-live="polite">
	{#if network.loading && empty}
		<progress aria-label={t('network.loading')}></progress>
		<small>
			{network.progress.total
				? t('network.progress', { records: network.progress.records, accounts: network.progress.accounts, total: network.progress.total })
				: t('network.loading')}
		</small>
	{:else}
		<small>
			{#if network.error}
				<span role="alert">{t('network.error')}</span>
			{:else}
				{counts}{#if network.loading} · {t('network.updating')}{/if}
			{/if}
		</small>
		<button type="button" onclick={refresh} disabled={network.loading}>{t('network.refresh')}</button>
	{/if}
</jl-network-status>

<style>
	jl-network-status {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-s);
		margin: var(--space-s) 0;
	}
	jl-network-status[empty] {
		display: block;
		padding: var(--space-l) 0;
		text-align: center;
	}
	jl-network-status[empty] small {
		display: block;
		margin-top: var(--space-s);
	}
	button {
		min-height: var(--tap-size);
		padding: 0 var(--space-s);
		border-color: transparent;
		font-size: var(--font-size-small);
		color: var(--color-muted);
	}
</style>
