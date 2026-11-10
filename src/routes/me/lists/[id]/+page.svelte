<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import config from '#lib/data/config.json';
	import CollectionName from '#lib/components/CollectionName.svelte';
	import ConfirmDialog from '#lib/components/ConfirmDialog.svelte';
	import Empty from '#lib/components/Empty.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import JobMarks from '#lib/components/JobMarks.svelte';
	import PageHeader from '#lib/components/PageHeader.svelte';
	import { collectionOf, isBuiltin } from '#lib/models/job-collection.js';
	import { LOCAL } from '#lib/models/list.js';
	import { deleteCollection, kept, renameCollection } from '#lib/network/job-collections.svelte.js';
	import { localLists } from '#lib/network/local-lists.svelte.js';
	import { formatNumber, t } from '#lib/i18n/index.svelte.js';

	/**
	 * One private list of jobs (Saved, Applied, Hidden or one someone named): its jobs,
	 * and for a named one, rename and delete. A private list of organizations has its own page.
	 */
	const id = $derived(page.params.id || '');
	const collection = $derived(collectionOf(kept.state, id));
	const builtin = $derived(isBuiltin(id));
	const name = $derived(collection ? (builtin ? t(`marks.${id}`) : collection.name) : '');
	const count = $derived(collection ? Object.keys(collection.jobs).length : 0);
	let renaming = $state(false);
	/** @type {ConfirmDialog | undefined} */
	let confirmer = $state();

	$effect(() => {
		if (!collection && localLists.records.some((r) => r.rkey === id)) goto(`/${LOCAL}/${id}`, { replaceState: true });
	});

	/** @param {string} value */
	function rename(value) {
		renameCollection(id, value);
		renaming = false;
	}

	async function remove() {
		deleteCollection(id);
		await goto('/me/lists', { replaceState: true });
	}
</script>

<svelte:head><title>{name || t('me.lists.title')} · {config.name}</title></svelte:head>

<jl-me-list>
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
		<Empty text={t('me.list.missing')}><a href="/me/lists"><Icon name="lists" /> {t('me.lists.title')}</a></Empty>
	{/if}
</jl-me-list>

<style>
	jl-me-list {
		display: block;
		max-width: var(--reading-width);
		margin-inline: auto;
		padding-bottom: var(--space-xl);
	}
	jl-me-list :global(jl-page-header menu > *) {
		font-size: var(--font-size-small);
	}
</style>
