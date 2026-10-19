<script>
	import Author from './Author.svelte';
	import { handleOf } from '#lib/network/network.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/** @type {{list: import('#lib/models/list.js').List, author?: boolean}} */
	let { list, author = true } = $props();
</script>

<jl-list>
	<a href="/{handleOf(list.did)}/{list.rkey}">{list.name}</a>
	{#if list.description}<p>{list.description}</p>{/if}
	<small>
		{t('list.companies', { count: list.companies.length })}{#if author}{' · '}{t('list.by')} <Author did={list.did} />{/if}
	</small>
</jl-list>

<style>
	jl-list {
		display: block;
		position: relative;
		padding: var(--space-s) 0;
		border-bottom: var(--border);
	}
	a {
		display: block;
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
