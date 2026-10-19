<script>
	import Author from './Author.svelte';
	import { handleOf } from '#lib/network/network.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/** @type {{list: import('#lib/models/list.js').List}} */
	let { list } = $props();
</script>

<jl-list>
	<a href="/{handleOf(list.did)}/{list.rkey}">{list.name}</a>
	<small>{t('list.companies', { count: list.companies.length })} · {t('list.by')} <Author did={list.did} /></small>
</jl-list>

<style>
	jl-list {
		display: block;
		padding: var(--space-s) 0;
		border-bottom: var(--border);
	}
	a {
		font-weight: 600;
		text-decoration: none;
	}
	small {
		display: block;
	}
</style>
