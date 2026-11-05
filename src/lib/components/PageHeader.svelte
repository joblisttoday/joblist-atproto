<script>
	/**
	 * A page's title, its short introduction, and its main action beside the title.
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
	jl-page-header {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		column-gap: var(--space-m);
		padding: var(--space-m) 0 var(--space-s);
	}
	h1,
	menu {
		margin: 0;
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
