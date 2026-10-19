<script>
	import { data, network, refresh } from '#lib/network/network.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';
</script>

<jl-network-status loading={network.loading || undefined}>
	<small>
		{#if network.loading}
			{t('network.loading')}
		{:else if network.error}
			<span role="alert">{network.error}</span>
		{:else}
			{t('network.counts', { companies: data.companies.size, lists: data.lists.length })}
		{/if}
	</small>
	<button type="button" onclick={refresh} disabled={network.loading}>{t('network.refresh')}</button>
</jl-network-status>

<style>
	jl-network-status {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-s);
		margin: var(--space-m) 0;
	}
	button {
		min-height: auto;
		padding: var(--space-xs) var(--space-s);
		font-size: var(--font-size-small);
	}
</style>
