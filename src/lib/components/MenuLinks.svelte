<script>
	import Row from './Row.svelte';

	/**
	 * A group of the menu's rows, as every row (Row.svelte): each a place (a link, ›) or an
	 * action (a button), with its icon, what it is, and its current value at the end.
	 * hidden: the label is said to screen readers only (a page's one group, under its title).
	 * @type {{label: string, items: import('#lib/navigation/nav.js').MenuLink[], hidden?: boolean}}
	 */
	let { label, items, hidden = false } = $props();
	const id = $props.id();
</script>

<section aria-labelledby={id}>
	{#if hidden}<jl-visually-hidden><h2 {id}>{label}</h2></jl-visually-hidden>{:else}<h2 {id}>{label}</h2>{/if}
	<menu>
		{#each items as item (item.label)}
			<li><Row title={item.label} icon={item.icon} href={item.href} onclick={item.onclick} external={item.external} count={item.value} /></li>
		{/each}
	</menu>
</section>

<style>
	section {
		margin-top: var(--space-l);
	}
	h2 {
		margin-bottom: var(--space-xs);
		color: var(--color-muted);
		font-size: var(--font-size-small);
	}
	menu {
		display: block;
		margin: 0;
		padding: 0;
	}
</style>
