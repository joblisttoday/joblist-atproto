<script>
	import config from '#lib/data/config.json';
	import { newCount, sameSearch, searchId } from '#lib/models/saved-search.js';
	import { searches } from '#lib/network/saved-searches.svelte.js';
	import { formatNumber, t } from '#lib/i18n/index.svelte.js';

	/**
	 * Your saved searches, as chips over the jobs: "Your searches" (the jobs matching any of
	 * them, the default: onyours), each with its new jobs (onopen), and "All jobs" (onopen(null)).
	 * Saved and forgotten with "Save search".
	 * @type {{filters: import('#lib/models/job.js').JobFilters, jobs: import('#lib/ats/job.js').Job[], names: Map<string, string>, yours: boolean, onyours: () => void, onopen: (search: import('#lib/models/saved-search.js').SavedSearch | null) => void}}
	 */
	let { filters, jobs, names, yours, onyours, onopen } = $props();

	/** @param {import('#lib/models/saved-search.js').SavedSearch} s */
	const label = (s) =>
		[s.query, s.where, s.remote && t(`jobs.filter.workplace.${s.remote}`), s.pay && t('jobs.filter.pay'), s.field].filter(Boolean).join(' · ') ||
		(s.near ? (s.within ? t(`near.within.${config.travel.mode}`, { minutes: s.within }) : t('near.me')) : t('saved.all'));
	const all = $derived(!filters.query && !filters.where && !filters.remote && !filters.pay && !filters.field && !filters.near && !filters.area);
</script>

{#if searches.list.length}
	<jl-search-chips>
		<menu aria-label={t('saved.searches')}>
			<li><button type="button" aria-pressed={yours ? 'true' : 'false'} onclick={onyours}>{t('searches.yours')}</button></li>
			{#each searches.list as search (searchId(search))}
				{@const fresh = jobs.length ? newCount(search, jobs, names) : 0}
				<li>
					<button type="button" aria-pressed={sameSearch(search, filters) ? 'true' : 'false'} onclick={() => onopen(search)}>
						{label(search)}
						{#if fresh}<small>{t('searches.new', { count: formatNumber(fresh) })}</small>{/if}
					</button>
				</li>
			{/each}
			<li><button type="button" aria-pressed={all && !yours ? 'true' : 'false'} onclick={() => onopen(null)}>{t('saved.all')}</button></li>
		</menu>
	</jl-search-chips>
{/if}

<style>
	jl-search-chips {
		display: block;
		margin-bottom: var(--space-s);
	}
	menu {
		gap: var(--space-xs);
		overflow-x: auto;
		scrollbar-width: none;
	}
	button {
		min-height: var(--chip-height);
		padding: 0 var(--space-m);
		border-radius: var(--radius-round);
		font-size: var(--font-size-small);
		white-space: nowrap;
	}
	button[aria-pressed='true'] {
		background: var(--color-accent);
		color: var(--color-accent-fg);
		border-color: var(--color-accent);
	}
	small {
		margin-inline-start: var(--space-xs);
		color: var(--color-ok);
	}
	button[aria-pressed='true'] small {
		color: inherit;
	}
</style>
