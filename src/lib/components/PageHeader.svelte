<script>
	/**
	 * A page's title, its menu at the right edge, and its short introduction under them.
	 * @type {{title: string, intro?: string, actions?: import('svelte').Snippet}}
	 */
	let { title, intro = '', actions } = $props();
</script>

<jl-page-header>
	<h1>{title}</h1>
	{#if actions}<menu>{@render actions()}</menu>{/if}
	{#if intro}<p>{intro}</p>{/if}
</jl-page-header>

<style>
	/* The title, its menu at the right edge, and the introduction under them
	   (a grid: a paragraph's reading width never puts it beside the title). */
	jl-page-header {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
		gap: var(--space-xs) var(--space-m);
		padding: var(--space-m) 0 var(--space-s);
	}
	h1,
	menu {
		margin: 0;
	}
	menu {
		justify-self: end;
	}
	p {
		grid-column: 1 / -1;
		margin: var(--space-xs) 0 0;
		color: var(--color-muted);
		font-size: var(--font-size-small);
	}
	@media (min-width: 48rem) {
		p {
			font-size: var(--font-size);
		}
	}
</style>
