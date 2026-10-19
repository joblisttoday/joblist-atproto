<script>
	/** @type {{tabs: {id: string, label: string}[], current: string}} */
	let { tabs, current = $bindable() } = $props();
</script>

<jl-tabs>
	<nav>
		{#each tabs as tab (tab.id)}
			<button type="button" aria-pressed={current === tab.id} onclick={() => (current = tab.id)}>{tab.label}</button>
		{/each}
	</nav>
</jl-tabs>

<style>
	nav {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: 1fr;
		gap: var(--space-xs);
		margin: var(--space-m) 0;
	}
	button[aria-pressed='true'] {
		background: var(--color-accent);
		color: var(--color-accent-fg);
		border-color: var(--color-accent);
	}
</style>
