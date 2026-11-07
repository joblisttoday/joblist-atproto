<script>
	import Icon from './Icon.svelte';
	import config from '#lib/data/config.json';
	import { goto } from '$app/navigation';
	import { filterJobs, offerCount } from '#lib/models/job.js';
	import { newCount, searchId, toParams } from '#lib/models/saved-search.js';
	import { forgetSearch, searches } from '#lib/network/saved-searches.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * The searches kept in this browser: each with its new jobs (published since last looked at)
	 * and all its jobs; opens in the explorer, or is removed.
	 * jobs: every job known, empty while they are read.
	 * @type {{jobs: import('#lib/ats/job.js').Job[], names: Map<string, string>}}
	 */
	let { jobs, names } = $props();

	/** @param {import('#lib/models/saved-search.js').SavedSearch} s */
	const label = (s) =>
		[s.query, s.where, s.remote && t(`jobs.filter.workplace.${s.remote}`), s.pay && t('jobs.filter.pay')].filter(Boolean).join(' · ') || (s.near ? '' : t('saved.all'));
	/** A search near someone: how far, not where. @param {number | undefined} within */
	const near = (within) => (within ? t(`near.within.${config.travel.mode}`, { minutes: within }) : t('near.me'));

	/** In the explorer, with its place near someone (not in the address). @param {import('#lib/models/saved-search.js').SavedSearch} search */
	function open(search) {
		searches.opening = search;
		goto(`/${toParams(search)}`);
	}
</script>

<jl-saved-searches>
	<ul>
		{#each searches.list as search (searchId(search))}
			{@const fresh = jobs.length ? newCount(search, jobs, names) : 0}
			{@const all = jobs.length ? offerCount(filterJobs(jobs, search, names)) : null}
			<li>
				<a
					href="/{toParams(search)}"
					onclick={(e) => {
						e.preventDefault();
						open(search);
					}}
				>
					<strong>
						{label(search)}
						{#if search.near}{#if label(search)} · {/if}<Icon name="near" /> {near(search.within)}{/if}
					</strong>
					{#if all !== null}<small>{t('saved.matching', { count: all.toLocaleString() })}</small>{/if}
				</a>
				{#if fresh}<mark>{t('searches.new', { count: fresh })}</mark>{/if}
				<button type="button" onclick={() => forgetSearch(search)}><Icon name="close" label={t('saved.remove', { name: label(search) || near(search.within) })} /></button>
			</li>
		{/each}
	</ul>
</jl-saved-searches>

<style>
	jl-saved-searches {
		display: block;
	}
	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	li {
		display: flex;
		align-items: center;
		gap: var(--space-s);
		border-bottom: var(--border);
	}
	a {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: center;
		min-height: var(--tap-size);
		padding: var(--space-s) 0;
		color: var(--color-fg);
		text-decoration: none;
	}
	small {
		color: var(--color-muted);
	}
	mark {
		padding: 0 var(--space-s);
		border-radius: var(--radius-round);
		background: var(--color-accent);
		color: var(--color-accent-fg);
		font-size: var(--font-size-small);
	}
	button {
		min-width: var(--tap-size);
		min-height: var(--tap-size);
		border: 0;
		background: none;
		color: var(--color-muted);
	}
</style>
