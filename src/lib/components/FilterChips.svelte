<script>
	import { formatNumber } from '#lib/i18n/index.svelte.js';

	/**
	 * A row of choices to filter by (fields of /jobs, an organization's teams), each with how
	 * many: one tap shows only it, again shows all. One row, swiped sideways on a phone.
	 * @type {{label: string, items: {id: string, label: string, count?: number}[], value?: string}}
	 */
	let { label, items, value = $bindable() } = $props();
</script>

<jl-filter-chips>
	<menu aria-label={label}>
		{#each items as item (item.id)}
			<li>
				<button type="button" aria-pressed={value === item.id ? 'true' : 'false'} onclick={() => (value = value === item.id ? '' : item.id)}>
					{item.label}
					{#if item.count}<small>{formatNumber(item.count)}</small>{/if}
				</button>
			</li>
		{/each}
	</menu>
</jl-filter-chips>

<style>
	jl-filter-chips {
		display: block;
		margin-top: var(--space-s);
	}
	menu {
		flex-wrap: nowrap;
		gap: var(--space-xs);
		margin: 0;
		overflow-x: auto;
		scrollbar-width: none;
	}
	menu > li {
		flex: none;
	}
	button {
		min-height: var(--chip-height);
		padding: 0 var(--space-m);
		border-radius: var(--radius-round);
		font-size: var(--font-size-small);
		white-space: nowrap;
	}
	small {
		margin-inline-start: var(--space-xxs);
		color: var(--color-muted);
	}
	button[aria-pressed='true'] {
		background: var(--color-accent);
		color: var(--color-accent-fg);
		border-color: var(--color-accent);
	}
	button[aria-pressed='true'] small {
		color: inherit;
	}
</style>
