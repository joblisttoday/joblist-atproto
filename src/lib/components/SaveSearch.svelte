<script>
	import { isEmpty } from '#lib/models/saved-search.js';
	import { forgetSearch, isSaved, saveSearch } from '#lib/network/saved-searches.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Keep the current search in this browser, or forget it.
	 * @type {{filters: import('#lib/models/job.js').JobFilters}}
	 */
	let { filters } = $props();
	const saved = $derived(isSaved(filters));
</script>

{#if !isEmpty(filters)}
	<jl-save-search saved={saved || undefined}>
		{#if saved}
			<small>✓ {t('searches.saved')}</small>
			<button type="button" onclick={() => forgetSearch(filters)}>{t('searches.forget')}</button>
		{:else}
			<button type="button" onclick={() => saveSearch(filters)}>{t('searches.save')}</button>
			<small>{t('searches.private')}</small>
		{/if}
	</jl-save-search>
{/if}

<style>
	jl-save-search {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-s);
		margin: var(--space-s) 0;
	}
</style>
