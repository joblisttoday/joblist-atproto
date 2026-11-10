<script>
	import Icon from './Icon.svelte';
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

{#if !isEmpty(filters) || filters.near}
	<!-- One toggle: kept in this browser only (said in its title), or forgotten. -->
	<jl-save-search saved={saved || undefined}>
		<button
			type="button"
			aria-pressed={saved ? 'true' : 'false'}
			title={t('searches.private')}
			onclick={() => (saved ? forgetSearch(filters) : saveSearch(filters))}
		>
			<Icon name={saved ? 'savedOn' : 'save'} /> {saved ? t('searches.saved') : t('searches.save')}
		</button>
	</jl-save-search>
{/if}

<style>
	jl-save-search {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-s);
	}
	button {
		min-height: var(--chip-height);
		padding: 0 var(--space-m);
		border-radius: var(--radius-round);
		font-size: var(--font-size-small);
	}
	button[aria-pressed='true'] {
		border-color: var(--color-accent);
	}
</style>
