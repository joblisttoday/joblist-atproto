<script>
	import { newCount, toParams } from '#lib/models/saved-search.js';
	import { searches } from '#lib/network/saved-searches.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * The searches kept in this browser, each with its jobs published since last looked at.
	 * @type {{
	 *   jobs: import('#lib/ats/job.js').Job[],
	 *   names: Map<string, string>,
	 *   onopen: (search: import('#lib/models/saved-search.js').SavedSearch) => void
	 * }}
	 */
	let { jobs, names, onopen } = $props();

	/** @param {import('#lib/models/saved-search.js').SavedSearch} s */
	const label = (s) =>
		[s.query, s.where, s.remote && t(`jobs.filter.workplace.${s.remote}`)].filter(Boolean).join(' · ');
</script>

{#if searches.list.length}
	<jl-saved-searches>
		<h2>{t('searches.title')}</h2>
		<ul>
			{#each searches.list as search (toParams(search))}
				{@const count = jobs.length ? newCount(search, jobs, names) : 0}
				<li>
					<a
						href="/jobs{toParams(search)}"
						onclick={(e) => {
							e.preventDefault();
							onopen(search);
						}}
					>
						{label(search)}
					</a>
					{#if count}<mark>{t('searches.new', { count })}</mark>{/if}
				</li>
			{/each}
		</ul>
	</jl-saved-searches>
{/if}

<style>
	jl-saved-searches {
		display: block;
		margin: var(--space-m) 0;
	}
	h2 {
		font-size: var(--font-size-small);
		margin: 0 0 var(--space-xs);
	}
	ul {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-s);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	li {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		min-height: var(--tap-size);
		padding: 0 var(--space-m);
		border: var(--border);
		border-radius: var(--radius-round);
	}
	a {
		color: var(--color-fg);
		text-decoration: none;
	}
	mark {
		background: none;
		color: var(--color-ok);
		font-size: var(--font-size-small);
	}
</style>
