<script>
	import CollectionName from './CollectionName.svelte';
	import Icon from './Icon.svelte';
	import { isBuiltin } from '#lib/models/job-collection.js';
	import { addCollection, kept, savedIn, toggleJob } from '#lib/network/job-collections.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * "Save": one tap keeps a job in Saved; beside it, a small popover puts it in the
	 * collections someone names too (each a toggle, and a new one). Kept in this browser only.
	 * @type {{job: import('#lib/ats/job.js').Job, company: string}} company: its name
	 */
	let { job, company } = $props();
	const id = $props.id();
	const named = $derived(kept.state.collections.filter((c) => !isBuiltin(c.id)));
	const inside = $derived(savedIn(job));
	const saved = $derived(inside.includes('saved'));
	// In named collections only: the job is kept, the more button says so.
	const elsewhere = $derived(inside.filter((c) => c !== 'saved').length);

	/** @param {string} name */
	function create(name) {
		toggleJob(job, addCollection(name), company);
	}
</script>

<jl-job-save saved={saved || undefined}>
	<button type="button" aria-pressed={saved ? 'true' : 'false'} onclick={() => toggleJob(job, 'saved', company)} title={t('collections.private')}>
		<Icon name={saved ? 'savedOn' : 'save'} /> {t(saved ? 'collections.saved' : 'collections.save')}
	</button>
	<button type="button" popovertarget="{id}-pick" aria-label={t('collections.more')} title={t('collections.more')}>
		<Icon name="add" />{#if elsewhere} <small>{elsewhere}</small>{/if}
	</button>
	<jl-collection-picker id="{id}-pick" popover="auto">
		<h2>{t('collections.pick')}</h2>
		<menu>
			<button type="button" aria-pressed={saved} onclick={() => toggleJob(job, 'saved', company)}>
				<Icon name={saved ? 'added' : 'add'} /> {t('marks.saved')}
			</button>
			{#each named as collection (collection.id)}
				<button type="button" aria-pressed={inside.includes(collection.id)} onclick={() => toggleJob(job, collection.id, company)}>
					<Icon name={inside.includes(collection.id) ? 'added' : 'add'} /> {collection.name}
				</button>
			{/each}
		</menu>
		<h3>{t('collections.new')}</h3>
		<CollectionName submit={t('collections.createSave')} onsubmit={create} />
		<p><small>{t('collections.private')}</small></p>
		<menu><button type="button" popovertarget="{id}-pick" popovertargetaction="hide">{t('collections.done')}</button></menu>
	</jl-collection-picker>
</jl-job-save>

<style>
	jl-job-save {
		display: contents;
	}
	jl-collection-picker {
		width: min(100% - 2 * var(--gutter), var(--search-width));
		padding: var(--space-m);
		border: var(--border);
		border-radius: var(--radius-large);
		background: var(--color-bg);
		color: var(--color-fg);
		box-shadow: var(--shadow);
	}
	h2 {
		margin-top: 0;
		font-size: var(--font-size-large);
	}
	h3 {
		font-size: var(--font-size);
	}
	p {
		color: var(--color-muted);
	}
	button[aria-pressed='true'] {
		background: var(--color-soft);
		color: var(--color-ok);
	}
	jl-collection-picker button[aria-pressed='true'] {
		background: var(--color-accent);
		color: var(--color-accent-fg);
		border-color: var(--color-accent);
	}
</style>
