<script>
	/**
	 * Over results: how many are shown, and the page's main action at the end of the line.
	 * @type {{count: string, children?: import('svelte').Snippet}}
	 */
	let { count, children } = $props();
</script>

<jl-results-head>
	<small aria-live="polite">{count}</small>
	{@render children?.()}
</jl-results-head>

<style>
	jl-results-head {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-xs) var(--space-s);
		margin: var(--space-s) 0 0;
		color: var(--color-muted);
	}
	jl-results-head > :global(a) {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
		font-size: var(--font-size-small);
	}
</style>
