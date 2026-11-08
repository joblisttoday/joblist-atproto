<script>
	import CollectionName from './CollectionName.svelte';
	import ConfirmDialog from './ConfirmDialog.svelte';
	import JobMarks from './JobMarks.svelte';
	import { isBuiltin } from '#lib/models/job-collection.js';
	import { deleteCollection, renameCollection } from '#lib/network/job-collections.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * One collection on /saved: its name, its jobs, and for the ones someone named,
	 * rename and delete.
	 * @type {{collection: import('#lib/models/job-collection.js').Collection}}
	 */
	let { collection } = $props();
	const builtin = $derived(isBuiltin(collection.id));
	const name = $derived(builtin ? t(`marks.${collection.id}`) : collection.name);
	const count = $derived(Object.keys(collection.jobs).length);
	let renaming = $state(false);

	/** @param {string} value */
	function rename(value) {
		renameCollection(collection.id, value);
		renaming = false;
	}

	/** @type {ConfirmDialog | undefined} */
	let confirmer = $state();
</script>

<jl-job-collection builtin={builtin || undefined} renaming={renaming || undefined}>
	<section aria-labelledby="collection-{collection.id}">
		<h2 id="collection-{collection.id}">{name} <small>{count || ''}</small></h2>
		{#if renaming}
			<CollectionName value={collection.name} submit={t('form.save')} onsubmit={rename} oncancel={() => (renaming = false)} />
		{:else if !builtin}
			<menu>
				<button type="button" onclick={() => (renaming = true)}>{t('collections.rename')}</button>
				<button type="button" onclick={() => confirmer?.ask()}>{t('collections.delete')}</button>
			</menu>
			<ConfirmDialog
				bind:this={confirmer}
				title={t('collections.confirmDelete', { name })}
				confirm={t('collections.delete')}
				onconfirm={() => deleteCollection(collection.id)}
			/>
		{/if}
		<JobMarks {collection} />
	</section>
</jl-job-collection>

<style>
	jl-job-collection {
		display: block;
	}
	small {
		color: var(--color-muted);
		font-weight: normal;
	}
	menu > * {
		font-size: var(--font-size-small);
	}
</style>
