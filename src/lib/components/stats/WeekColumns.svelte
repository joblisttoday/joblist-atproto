<script>
	import { longDate } from '#lib/i18n/dates.js';
	import { formatNumber, i18n, t } from '#lib/i18n/index.svelte.js';

	/**
	 * New jobs each week, as columns: the week under way lighter, said "so far".
	 * Each column says its week and count on hover; a table says them all.
	 * @type {{weeks: import('#lib/models/stats.js').Week[]}}
	 */
	let { weeks } = $props();
	const formatDate = (/** @type {string} */ week) => longDate(week, i18n.locale);
	const top = $derived(Math.max(1, ...weeks.map((w) => w.new)));
	const label = (/** @type {import('#lib/models/stats.js').Week} */ w) =>
		t(w.partial ? 'stats.week.partial' : 'stats.week', { week: formatDate(w.week), count: w.new });
</script>

<jl-week-columns>
	<!-- Hover says each week; the table says them all (and is what screen readers read). -->
	<ol aria-hidden="true">
		{#each weeks as week, i (week.week)}
			<li title={label(week)} data-partial={week.partial || undefined}>
				<span style:block-size="{(week.new / top) * 100}%"></span>
				{#if i === weeks.length - 1}<small>{formatNumber(week.new)}</small>{/if}
			</li>
		{/each}
	</ol>
	<details>
		<summary>{t('stats.table')}</summary>
		<table>
			<thead><tr><th scope="col">{t('stats.table.week')}</th><th scope="col">{t('stats.table.new')}</th><th scope="col">{t('stats.table.closed')}</th><th scope="col">{t('stats.table.open')}</th></tr></thead>
			<tbody>
				{#each weeks as week (week.week)}
					<tr><th scope="row">{formatDate(week.week)}{#if week.partial} ({t('stats.soFar')}){/if}</th><td>{formatNumber(week.new)}</td><td>{formatNumber(week.closed)}</td><td>{formatNumber(week.open)}</td></tr>
				{/each}
			</tbody>
		</table>
	</details>
</jl-week-columns>

<style>
	jl-week-columns {
		display: block;
	}
	ol {
		display: flex;
		align-items: flex-end;
		gap: var(--chart-gap);
		block-size: var(--chart-height);
		margin: 0;
		padding: var(--space-l) 0 0;
		list-style: none;
		border-bottom: var(--border);
	}
	li {
		position: relative;
		display: flex;
		align-items: flex-end;
		justify-content: center;
		flex: 1;
		max-inline-size: var(--chart-bar);
		block-size: 100%;
	}
	span {
		display: block;
		inline-size: 100%;
		min-block-size: var(--chart-gap);
		border-radius: var(--chart-radius) var(--chart-radius) 0 0;
		background: var(--color-series-1);
	}
	li[data-partial] span {
		opacity: 0.45;
	}
	li:hover span {
		filter: brightness(1.15);
	}
	small {
		position: absolute;
		inset-block-end: 100%;
		color: var(--color-fg);
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}
	details {
		margin-top: var(--space-s);
		font-size: var(--font-size-small);
	}
	table {
		border-collapse: collapse;
		font-variant-numeric: tabular-nums;
	}
	th,
	td {
		padding: var(--space-xs) var(--space-m) var(--space-xs) 0;
		text-align: end;
	}
	th[scope='row'],
	th[scope='col']:first-child {
		text-align: start;
		font-weight: normal;
	}
</style>
