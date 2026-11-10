<script>
	import config from '#lib/data/config.json';
	import { findLists } from '#lib/models/list-filters.js';
	import { data, handleOf } from '#lib/network/network.svelte.js';
	import { listJobStats } from '#lib/network/job-counts.svelte.js';
	import { formatNumber, t } from '#lib/i18n/index.svelte.js';

	/**
	 * Lists people made, as a way in: those with the most open jobs first
	 * (config.lists.explore of them), each a job board of its own.
	 * One row, swiped sideways on a phone.
	 */
	const stats = $derived(new Map(data.lists.map((l) => [l.uri, listJobStats(l)])));
	const shown = $derived(
		findLists(data.lists, { query: '', hiring: true, open: false }, stats, { handleOf }).slice(0, config.lists.explore)
	);
</script>

{#if shown.length}
	<jl-explore-lists>
		<menu aria-label={t('explore.lists')}>
			{#each shown as list (list.uri)}
				<li>
					<a href="/{handleOf(list.did)}/{list.rkey}">{list.name} <small>{formatNumber(stats.get(list.uri)?.jobs || 0)}</small></a>
				</li>
			{/each}
		</menu>
	</jl-explore-lists>
{/if}

<style>
	jl-explore-lists {
		display: block;
		margin-top: var(--space-s);
	}
	menu {
		flex-wrap: nowrap;
		gap: var(--space-xs);
		margin: 0;
		overflow-x: auto;
		scrollbar-width: none;
	}
	menu > li {
		flex: none;
	}
	menu a {
		min-height: var(--chip-height);
		padding: 0 var(--space-m);
		border-radius: var(--radius-round);
		font-size: var(--font-size-small);
		white-space: nowrap;
	}
</style>
