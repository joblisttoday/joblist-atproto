<script>
	import Author from './Author.svelte';
	import { handleOf } from '#lib/network/network.svelte.js';
	import { listJobStats } from '#lib/network/job-counts.svelte.js';
	import { session } from '#lib/auth/session.svelte.js';
	import { LOCAL } from '#lib/models/list.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * A list among others: its name, what it is, how many companies and how many of them hire,
	 * its open jobs at the end of the name's line (in its place for a list about one).
	 * stats: when the page already counted them.
	 * @type {{list: import('#lib/models/list.js').List, author?: boolean, stats?: import('#lib/models/list-filters.js').ListStats}}
	 */
	let { list, author = true, stats: counted } = $props();
	const stats = $derived(counted || listJobStats(list));
</script>

<!-- Where it is kept, always said: on this device (private), or published (yours, or someone's). -->
<jl-list open={list.open || undefined} hiring={stats.hiring > 0 || undefined} local={list.did === LOCAL || undefined}>
	<a href="/{handleOf(list.did)}/{list.rkey}">{list.name}</a>
	{#if stats.jobs}<data value={stats.jobs}>{t('jobs.count', { count: stats.jobs })}</data>{/if}
	{#if list.description}<p>{list.description}</p>{/if}
	<small>
		{#if list.did === LOCAL}<mark>{t('list.local')}</mark>{:else if list.did === session.did}<mark>{t('list.yours')}</mark>{/if}
		{t('list.companies', { count: stats.companies })}{#if stats.hiring}{' · '}{t('list.hiring', { count: stats.hiring })}{/if}{#if list.open}{' · '}{t('list.open')}{/if}{#if author && list.did !== LOCAL && list.did !== session.did}{' · '}{t('list.by')} <Author did={list.did} />{/if}
	</small>
</jl-list>

<style>
	mark {
		margin-inline-end: var(--space-xs);
		padding: 0 var(--space-xs);
		border-radius: var(--radius);
		background: var(--color-soft);
		color: var(--color-fg);
	}
	jl-list {
		display: block;
		position: relative;
		padding: var(--space-s) 0;
		border-bottom: var(--border);
	}
	a {
		font-weight: var(--font-weight-strong);
		text-decoration: none;
	}
	/* The whole row opens the list; the author link stays on top. */
	a::after {
		content: '';
		position: absolute;
		inset: 0;
	}
	a:hover {
		text-decoration: underline;
	}
	/* Open jobs: at the end of the name's line. */
	data {
		float: inline-end;
		font-size: var(--font-size-small);
		color: var(--color-muted);
	}
	p {
		margin: 0;
		color: var(--color-muted);
		font-size: var(--font-size-small);
		display: -webkit-box;
		-webkit-line-clamp: 1;
		line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	small {
		display: block;
	}
	small :global(a) {
		position: relative;
		z-index: 1;
	}
</style>
