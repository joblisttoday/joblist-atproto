<script>
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * One of someone's lists (models/own-lists.js): its name, what it holds and how many,
	 * and whether others can see it.
	 * @type {{list: import('#lib/models/own-lists.js').OwnList}}
	 */
	let { list } = $props();
	const name = $derived(list.builtin ? t(`marks.${list.id}`) : list.name);
	const count = $derived(list.kind === 'jobs' ? t('saved.matching', { count: list.count }) : t('list.companies', { count: list.count }));
</script>

<jl-own-list public={list.public || undefined}>
	<a href={list.href}>{name}</a>
	<small><mark>{t(list.public ? 'list.public' : 'list.private')}</mark> {count}</small>
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
	mark {
		margin-inline-end: var(--space-xs);
		padding: 0 var(--space-xs);
		border-radius: var(--radius);
		background: var(--color-soft);
		color: var(--color-fg);
	}
</style>
