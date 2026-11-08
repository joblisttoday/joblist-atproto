<script>
	import { formatNumber } from '#lib/i18n/index.svelte.js';

	/**
	 * Ranked horizontal bars, one hue, largest first: each row its name (a link),
	 * its bar, its value at the tip, and a note under it ("+120 this week · 44 days open").
	 * @type {{rows: {key: string, href: string, label: string, value: number, note?: string}[], label: string}}
	 */
	let { rows, label } = $props();
	const top = $derived(Math.max(1, ...rows.map((r) => r.value)));
</script>

<jl-ranked-bars>
	<ol aria-label={label}>
		{#each rows as row (row.key)}
			<li>
				<a href={row.href}>{row.label}</a>
				<jl-bar><span style:inline-size="{(row.value / top) * 100}%"></span><data value={row.value}>{formatNumber(row.value)}</data></jl-bar>
				{#if row.note}<small>{row.note}</small>{/if}
			</li>
		{/each}
	</ol>
</jl-ranked-bars>

<style>
	jl-ranked-bars {
		display: block;
	}
	ol {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	li {
		display: grid;
		grid-template-columns: minmax(0, var(--chart-label)) minmax(0, 1fr);
		align-items: center;
		column-gap: var(--space-s);
		padding: var(--space-xs) 0;
	}
	a {
		min-height: var(--chip-height);
		align-content: center;
		overflow: hidden;
		color: var(--color-fg);
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	jl-bar {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		min-inline-size: 0;
	}
	span {
		display: block;
		min-inline-size: var(--chart-gap);
		block-size: var(--chart-thin);
		border-radius: 0 var(--chart-radius) var(--chart-radius) 0;
		background: var(--color-series-1);
	}
	li:hover span {
		filter: brightness(1.15);
	}
	data {
		flex: none;
		font-size: var(--font-size-small);
		font-variant-numeric: tabular-nums;
	}
	small {
		grid-column: 2;
		color: var(--color-muted);
	}
</style>
