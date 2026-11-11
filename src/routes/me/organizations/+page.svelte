<script>
	import config from '#lib/data/config.json';
	import Empty from '#lib/components/Empty.svelte';
	import KeepForm from '#lib/components/KeepForm.svelte';
	import KeptOrganizations from '#lib/components/KeptOrganizations.svelte';
	import PageHeader from '#lib/components/PageHeader.svelte';
	import { kept } from '#lib/network/kept.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/** Every organization kept in this browser, and a link to keep another. */
</script>

<svelte:head><title>{t('kept.title')} · {config.name}</title></svelte:head>

<jl-me-organizations>
	<PageHeader title={t('kept.title')} intro={t('kept.intro')} />
	<KeepForm />
	{#if kept.list.length}
		<KeptOrganizations />
	{:else}
		<Empty text={t('kept.empty')} />
	{/if}
</jl-me-organizations>

<style>
	jl-me-organizations {
		display: block;
		max-width: var(--reading-width);
		margin-inline: auto;
		padding-bottom: var(--space-xl);
	}
	jl-me-organizations > :global(jl-keep-form) {
		display: block;
		margin-bottom: var(--space-m);
	}
</style>
