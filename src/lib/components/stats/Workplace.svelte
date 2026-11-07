<script>
	import { percent, share } from '#lib/models/stats.js';
	import { i18n, t } from '#lib/i18n/index.svelte.js';

	/**
	 * Where the open jobs happen: one thin bar of its parts, and the list of them
	 * with their share and count beside a swatch (the colours are never alone).
	 * @type {{workplace: import('#lib/models/stats.js').Stats['now']['workplace']}}
	 */
	let { workplace } = $props();
	const parts = $derived(
		/** @type {const} */ ([
			['onsite', 'var(--color-series-1)'],
			['hybrid', 'var(--color-series-2)'],
			['remote', 'var(--color-series-3)'],
			['unsaid', 'var(--color-series-none)']
		]).map(([kind, color]) => ({ kind, color, count: workplace[kind] }))
	);
	const total = $derived(parts.reduce((sum, p) => sum + p.count, 0));
</script>

<jl-workplace>
	<jl-segments aria-hidden="true">
		{#each parts as part (part.kind)}
			{#if part.count}<span style:flex-grow={part.count} style:background={part.color}></span>{/if}
		{/each}
	</jl-segments>
	<ul>
		{#each parts as part (part.kind)}
			<li>
				<i style:background={part.color}></i>
				{t(`stats.workplace.${part.kind}`)}
				<strong>{percent(share(part.count, total), i18n.locale)}</strong>
				<small>{t('jobs.count', { count: part.count })}</small>
			</li>
		{/each}
	</ul>
</jl-workplace>

<style>
	jl-workplace {
		display: block;
	}
	jl-segments {
		display: flex;
		gap: var(--chart-gap);
		block-size: var(--chart-thin);
	}
	span {
		flex-basis: 0;
		border-radius: var(--radius-round);
	}
	ul {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-xs) var(--space-l);
		margin: var(--space-s) 0 0;
		padding: 0;
		list-style: none;
	}
	li {
		display: flex;
		align-items: baseline;
		gap: var(--space-xs);
	}
	i {
		display: inline-block;
		inline-size: var(--chart-swatch);
		block-size: var(--chart-swatch);
		border-radius: var(--radius-round);
	}
	strong {
		font-variant-numeric: tabular-nums;
	}
	small {
		color: var(--color-muted);
	}
</style>
