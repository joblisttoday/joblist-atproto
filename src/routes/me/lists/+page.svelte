<script>
	import { goto } from '$app/navigation';
	import config from '#lib/data/config.json';
	import CollectionName from '#lib/components/CollectionName.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import OwnListItem from '#lib/components/OwnListItem.svelte';
	import PageHeader from '#lib/components/PageHeader.svelte';
	import { jobListPath } from '#lib/models/own-lists.js';
	import { addCollection } from '#lib/network/job-collections.svelte.js';
	import { own } from '#lib/network/own-lists.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Every list of yours, of jobs and of organizations, each saying whether it is private
	 * or public; each opens on its own page. A new list of jobs is named here; a list of
	 * organizations has its own form. /me/lists#new opens the name of a new list of jobs.
	 */
	let naming = $state(location.hash === '#new');

	/** @param {string} name */
	async function create(name) {
		await goto(jobListPath(addCollection(name)));
	}
</script>

<svelte:head><title>{t('me.lists.title')} · {config.name}</title></svelte:head>

<jl-me-lists>
	<PageHeader title={t('me.lists.title')} intro={t('me.lists.intro')} />
	<ul>
		{#each own.lists as list (list.id)}<li><OwnListItem {list} /></li>{/each}
	</ul>
	{#if naming}
		<CollectionName submit={t('collections.create')} onsubmit={create} oncancel={() => (naming = false)} />
	{:else}
		<menu>
			<button type="button" data-add onclick={() => (naming = true)}><Icon name="add" /> {t('collections.new')}</button>
			<a href="/lists/new" data-add><Icon name="add" /> {t('list.new.organizations')}</a>
		</menu>
	{/if}
	<p><small><a href="/menu/collections">{t('collections.transfer')}</a></small></p>
</jl-me-lists>

<style>
	jl-me-lists {
		display: block;
		max-width: var(--reading-width);
		margin-inline: auto;
		padding-bottom: var(--space-xl);
	}
	ul {
		margin: 0 0 var(--space-m);
		padding: 0;
		list-style: none;
	}
</style>
