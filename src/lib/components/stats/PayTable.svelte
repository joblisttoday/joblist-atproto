<script>
	import { payAmount } from '#lib/models/salary.js';
	import { payCurrencies } from '#lib/models/stats.js';
	import { i18n, t } from '#lib/i18n/index.svelte.js';

	/**
	 * Typical yearly pay per field, where enough jobs say it: the middle of their
	 * ranges, in the currencies most given (none converted).
	 * @type {{fields: import('#lib/models/stats.js').Stats['now']['fields']}}
	 */
	let { fields } = $props();
	const currencies = $derived(payCurrencies(fields, 3));
	const shown = $derived(fields.filter((f) => currencies.some((c) => f.pay[c])));
</script>

{#if shown.length}
	<jl-pay-table>
		<table>
			<thead>
				<tr>
					<th scope="col">{t('stats.pay.field')}</th>
					{#each currencies as currency (currency)}<th scope="col">{currency}</th>{/each}
				</tr>
			</thead>
			<tbody>
				{#each shown as field (field.slug)}
					<tr>
						<th scope="row"><a href="/field/{field.slug}">{t(`field.${field.slug}`)}</a></th>
						{#each currencies as currency (currency)}
							<td>{field.pay[currency] ? payAmount({ min: field.pay[currency], currency, period: 'year' }, i18n.locale) : '–'}</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</jl-pay-table>
{/if}

<style>
	jl-pay-table {
		display: block;
		overflow-x: auto;
	}
	table {
		border-collapse: collapse;
		inline-size: 100%;
		font-variant-numeric: tabular-nums;
	}
	th,
	td {
		padding: var(--space-xs) var(--space-s);
		border-bottom: var(--border);
		text-align: end;
		white-space: nowrap;
	}
	th:first-child {
		padding-inline-start: 0;
		text-align: start;
		font-weight: normal;
	}
	thead th {
		color: var(--color-muted);
		font-size: var(--font-size-small);
	}
	a {
		color: var(--color-fg);
	}
</style>
