<script>
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * One of someone's lists of jobs (models/own-lists.js): its name and how many it holds.
	 * @type {{list: import('#lib/models/own-lists.js').OwnList}}
	 */
	let { list } = $props();
	const name = $derived(list.builtin ? t(`marks.${list.id}`) : list.name);
	const count = $derived(t('saved.matching', { count: list.count }));
</script>

<jl-own-list>
	<a href={list.href}>{name}</a>
	<small>{count}</small>
</jl-own-list>

<style>
	jl-own-list {
		display: block;
		position: relative;
		padding: var(--space-s) 0;
		border-bottom: var(--border);
	}
	a {
		font-weight: var(--font-weight-strong);
		text-decoration: none;
	}
	/* The whole row opens the list. */
	a::after {
		content: '';
		position: absolute;
		inset: 0;
	}
	a:hover {
		text-decoration: underline;
	}
	small {
		display: block;
		color: var(--color-muted);
	}
</style>
