<script>
	import { data, network, refresh } from '#lib/network/network.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	// Quiet by default: shown on the first visit (nothing cached yet), or when the network failed.
	const first = $derived(network.loading && !data.companies.size && !data.lists.length);
	const progress = $derived(
		network.progress.total
			? t('network.progress', { records: network.progress.records, accounts: network.progress.accounts, total: network.progress.total })
			: t('network.loading')
	);
</script>

<jl-network-status loading={first || undefined} failed={(!network.loading && Boolean(network.error)) || undefined} aria-live="polite">
	{#if first}
		<progress aria-label={t('network.loading')}></progress>
		<small>{progress}</small>
	{:else if network.error && !network.loading}
		<p role="alert">
			{t('network.error')}
			<button type="button" onclick={refresh}>{t('network.retry')}</button>
		</p>
	{/if}
</jl-network-status>

<style>
	jl-network-status {
		display: block;
		padding: 0 var(--gutter);
	}
	jl-network-status:not([loading]):not([failed]) {
		display: none;
	}
	small {
		display: block;
		padding: var(--space-xs) 0;
	}
	p {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-s);
		margin: 0;
		padding: var(--space-xs) 0;
		font-size: var(--font-size-small);
	}
</style>
