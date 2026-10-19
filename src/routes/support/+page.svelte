<script>
	import config from '#lib/data/config.json';
	import revenue from '#lib/data/revenue.json';
	import { t } from '#lib/i18n/index.svelte.js';
</script>

<svelte:head><title>{t('support.title')} · {config.name}</title></svelte:head>

<jl-support-page>
	<h1>{t('support.title')}</h1>
	<p>{t('support.intro')}</p>
	{#if revenue.support.paymentLink}
		<menu><a href={revenue.support.paymentLink} rel="noopener">{t('support.pay')}</a></menu>
		<p><small>{t('support.privacy')}</small></p>
	{:else}
		<p>{t('support.unavailable')}</p>
	{/if}
	<p><small><a href="/featured">{t('featured.title')}</a></small></p>
</jl-support-page>

<style>
	jl-support-page {
		display: block;
	}
	menu > a {
		background: var(--color-accent);
		color: var(--color-accent-fg);
		border-color: var(--color-accent);
		font-weight: var(--font-weight-strong);
	}
</style>
