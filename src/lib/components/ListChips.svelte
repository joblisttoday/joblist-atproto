<script>
	import CollectionName from './CollectionName.svelte';
	import Icon from './Icon.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { jobListPath } from '#lib/models/own-lists.js';
	import { addCollection } from '#lib/network/job-collections.svelte.js';
	import { own } from '#lib/network/own-lists.svelte.js';
	import { formatNumber, t } from '#lib/i18n/index.svelte.js';

	/**
	 * Jobs' lists, as chips under Explore's switch: all the jobs (/jobs), then your lists
	 * (Saved, Applied, Hidden and the ones you name, /jobs/{id}, private in this browser), and
	 * a new one.
	 */
	let naming = $state(false);

	/** @param {string} name */
	async function create(name) {
		naming = false;
		await goto(jobListPath(addCollection(name)));
	}
</script>

<jl-list-chips>
	<menu aria-label={t('me.lists.title')}>
		<li><a href="/jobs" aria-current={page.url.pathname === '/jobs' ? 'page' : undefined}>{t('lists.open')}</a></li>
		{#each own.lists as list (list.id)}
			<li>
				<a href={list.href} aria-current={page.url.pathname === list.href ? 'page' : undefined}>
					{list.builtin ? t(`marks.${list.id}`) : list.name}{#if list.count}<small>{formatNumber(list.count)}</small>{/if}
				</a>
			</li>
		{/each}
		<li><button type="button" aria-expanded={naming} onclick={() => (naming = !naming)}><Icon name="add" label={t('collections.new')} /></button></li>
	</menu>
	{#if naming}<CollectionName submit={t('collections.create')} onsubmit={create} oncancel={() => (naming = false)} />{/if}
</jl-list-chips>

<style>
	jl-list-chips {
		display: block;
		margin-top: var(--space-s);
	}
	menu {
		display: flex;
		flex-wrap: nowrap;
		gap: var(--space-xs);
		margin: 0 calc(-1 * var(--gutter));
		padding: 0 var(--gutter);
		overflow-x: auto;
		scrollbar-width: none;
	}
	li {
		flex: none;
	}
	a,
	button {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
		min-height: var(--chip-height);
		padding: 0 var(--space-m);
		border: var(--border);
		border-radius: var(--radius-round);
		background: var(--color-bg);
		color: var(--color-fg);
		font-size: var(--font-size-small);
		text-decoration: none;
		white-space: nowrap;
	}
	button {
		justify-content: center;
		min-width: var(--tap-size);
		padding: 0 var(--space-s);
	}
	small {
		color: var(--color-muted);
	}
	a[aria-current] {
		background: var(--color-accent);
		border-color: var(--color-accent);
		color: var(--color-accent-fg);
	}
	a[aria-current] small {
		color: inherit;
	}
</style>
