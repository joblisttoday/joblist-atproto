<script>
	/**
	 * Nothing here yet: what is missing, and what to do about it (its links or buttons).
	 * @type {{text: string, children?: import('svelte').Snippet}}
	 */
	let { text, children } = $props();
</script>

<jl-empty>
	<p>{text}</p>
	{#if children}<menu>{@render children()}</menu>{/if}
</jl-empty>

<style>
	jl-empty {
		display: block;
		margin: var(--space-s) 0;
		padding: var(--space-m);
		border: var(--border-dashed);
		border-radius: var(--radius);
		color: var(--color-muted);
	}
	p {
		margin: 0;
		font-size: var(--font-size-small);
	}
	menu {
		margin: var(--space-s) 0 0;
	}
</style>
