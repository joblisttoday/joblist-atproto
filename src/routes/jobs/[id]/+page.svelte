<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import config from '#lib/data/config.json';
	import CollectionName from '#lib/components/CollectionName.svelte';
	import ConfirmDialog from '#lib/components/ConfirmDialog.svelte';
	import Empty from '#lib/components/Empty.svelte';
	import ExploreTabs from '#lib/components/ExploreTabs.svelte';
	import ListChips from '#lib/components/ListChips.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import JobMarks from '#lib/components/JobMarks.svelte';
	import PageHeader from '#lib/components/PageHeader.svelte';
	import { collectionOf, isBuiltin } from '#lib/models/job-collection.js';
	import { deleteCollection, kept, renameCollection } from '#lib/network/job-collections.svelte.js';
	import { formatNumber, t } from '#lib/i18n/index.svelte.js';

	/**
	 * One private list of jobs (/jobs/{id}: Saved, Applied, Hidden or one someone named), in
	 * Explore's Jobs: its jobs, and for a named one, rename and delete.
	 */
	const id = $derived(page.params.id || '');
	const collection = $derived(collectionOf(kept.state, id));
	const builtin = $derived(isBuiltin(id));
	const name = $derived(collection ? (builtin ? t(`marks.${id}`) : collection.name) : '');
	const count = $derived(collection ? Object.keys(collection.jobs).length : 0);
	let renaming = $state(false);
	/** @type {ConfirmDialog | undefined} */
	let confirmer = $state();

	/** @param {string} value */
	function rename(value) {
		renameCollection(id, value);
		renaming = false;
	}

	async function remove() {
		deleteCollection(id);
		await goto('/jobs', { replace: true });
	}
</script>

<svelte:head><title>{name || t('me.lists.title')} · {config.name}</title></svelte:head>

<jl-me-list>
	<ExploreTabs />
	<ListChips />
	{#if collection}
		<PageHeader title={name} intro={[t('saved.matching', { count: formatNumber(count) }), t('list.private')].join(' · ')}>
			{#snippet actions()}
				{#if !builtin && !renaming}
					<button type="button" onclick={() => (renaming = true)}>{t('collections.rename')}</button>
					<button type="button" onclick={() => confirmer?.ask()}>{t('collections.delete')}</button>
				{/if}
			{/snippet}
		</PageHeader>
		{#if renaming}
			<CollectionName value={collection.name} submit={t('form.save')} onsubmit={rename} oncancel={() => (renaming = false)} />
		{/if}
		{#if !builtin}
			<ConfirmDialog bind:this={confirmer} title={t('collections.confirmDelete', { name })} confirm={t('collections.delete')} onconfirm={remove} />
		{/if}
		<JobMarks {collection} />
	{:else}
		<PageHeader title={t('me.lists.title')} />
		<Empty text={t('me.list.missing')}><a href="/jobs"><Icon name="jobs" /> {t('lists.open')}</a></Empty>
	{/if}
</jl-me-list>

<style>
	jl-me-list {
		display: block;
		max-width: var(--reading-width);
		margin-inline: auto;
		padding: var(--space-s) 0 var(--space-xl);
	}
	jl-me-list :global(jl-page-header menu > *) {
		font-size: var(--font-size-small);
	}
</style>
