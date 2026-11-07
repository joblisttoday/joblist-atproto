<script>
	import { LOCAL } from '#lib/models/list.js';
	import Author from './Author.svelte';
	import ListActions from './ListActions.svelte';
	import { handleOf } from '#lib/network/network.svelte.js';
	import { parseUri } from '#lib/models/list.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * The list's header, kept small over its jobs: its name and actions on one line,
	 * who made it and whether anyone can add to it, what it is about (one line on phones).
	 * @type {{list: import('#lib/models/list.js').List, pending?: number, suggesting?: boolean, reviewing?: boolean}}
	 */
	let { list, pending = 0, suggesting = $bindable(false), reviewing = $bindable(false) } = $props();
	const source = $derived(list.copiedFrom ? parseUri(list.copiedFrom) : null);
</script>

<jl-list-header open={list.open || undefined}>
	<h1>{list.name}</h1>
	<ListActions {list} {pending} bind:suggesting bind:reviewing />
	<p>
		<small>
			{#if list.did === LOCAL}{t('list.local')}{:else}{t('list.by')} <Author did={list.did} /> · {list.open ? t('list.open') : t('list.closed')}{/if}
			{#if source}
				· {t('list.copiedFrom')} <a href="/{handleOf(source.did)}/{source.rkey}">@{handleOf(source.did)}</a>
			{/if}
		</small>
	</p>
	<!-- What it is about, cut to fit; a tap shows all of it. -->
	{#if list.description}<details><summary>{list.description}</summary></details>{/if}
</jl-list-header>

<style>
	jl-list-header {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
		column-gap: var(--space-s);
	}
	h1 {
		margin: 0;
		font-size: var(--font-size-large);
		overflow-wrap: anywhere;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	p,
	summary {
		grid-column: 1 / -1;
		max-width: none;
		margin: 0;
		font-size: var(--font-size-small);
		color: var(--color-muted);
		display: -webkit-box;
		-webkit-line-clamp: 1;
		line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	details {
		grid-column: 1 / -1;
	}
	summary {
		padding: 0;
		font-weight: normal;
		list-style: none;
	}
	summary::-webkit-details-marker {
		display: none;
	}
	details[open] summary {
		display: block;
		max-height: var(--textarea-max);
		overflow-y: auto;
	}
	@media (min-width: 64rem) {
		summary {
			-webkit-line-clamp: 2;
			line-clamp: 2;
		}
	}
</style>
