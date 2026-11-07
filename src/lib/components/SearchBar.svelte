<script>
	/**
	 * A page's search: words, then a row of chips (filters, with their counts) and,
	 * at its end, the tools (how to show what is found). One row on wide screens.
	 * chips: `<li><button aria-pressed>` items; filters: the chips' name.
	 * @type {{
	 *   query?: string,
	 *   label: string,
	 *   filters: string,
	 *   chips?: import('svelte').Snippet,
	 *   tools?: import('svelte').Snippet
	 * }}
	 */
	let { query = $bindable(''), label, filters, chips, tools } = $props();
	const id = $props.id();
</script>

<jl-search-bar>
	<form role="search" onsubmit={(e) => e.preventDefault()}>
		<!-- Its name stays in sight, small on its edge. -->
		<jl-search-field>
			<label for="{id}-query">{label}</label>
			<input id="{id}-query" type="search" bind:value={query} enterkeyhint="search" />
		</jl-search-field>
		<jl-search-chips>
			<menu aria-label={filters}>{@render chips?.()}</menu>
			{@render tools?.()}
		</jl-search-chips>
	</form>
</jl-search-bar>

<style>
	jl-search-bar {
		display: block;
		min-width: 0;
	}
	form {
		display: grid;
		gap: var(--space-s);
	}
	jl-search-chips {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		min-width: 0;
	}
	menu {
		flex: 1;
		min-width: 0;
		flex-wrap: nowrap;
		margin: 0;
		gap: var(--space-xs);
		overflow-x: auto;
		scrollbar-width: none;
	}
	menu > :global(li) {
		flex: none;
	}
	menu :global(button) {
		min-height: var(--chip-height);
		padding: 0 var(--space-m);
		border-radius: var(--radius-round);
		font-size: var(--font-size-small);
		white-space: nowrap;
	}
	menu :global(button[aria-pressed='true']) {
		background: var(--color-accent);
		color: var(--color-accent-fg);
		border-color: var(--color-accent);
	}
	menu :global(small) {
		color: inherit;
		opacity: 0.7;
	}
	@media (min-width: 64rem) {
		form {
			grid-template-columns: minmax(0, 1fr) auto;
		}
	}
</style>
