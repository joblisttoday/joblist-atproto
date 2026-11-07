<script>
	import CompanyMark from './CompanyMark.svelte';
	import Icon from './Icon.svelte';
	import { data } from '#lib/network/network.svelte.js';
	import { jobCounts } from '#lib/network/job-counts.svelte.js';
	import { moveItem } from '#lib/models/list-form.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * The companies of the list, in its order: move one up or down, or remove it.
	 * @type {{companies: string[]}}
	 */
	let { companies = $bindable() } = $props();

	/** @param {number} from @param {number} to */
	const move = (from, to) => (companies = moveItem(companies, from, to));
</script>

<jl-list-company-order count={companies.length}>
	{#if companies.length}
		<ol>
			{#each companies as key, i (key)}
				{@const company = data.companies.get(key)}
				{@const jobs = jobCounts().get(key) || 0}
				{@const name = company?.name || key}
				<li>
					<CompanyMark {key} {name} />
					<span>
						{name}
						<small>{company ? (jobs ? t('jobs.count', { count: jobs }) : key) : t('form.list.unknown')}</small>
					</span>
					<button type="button" onclick={() => move(i, i - 1)} disabled={i === 0}>
						<Icon name="up" label={t('form.list.up', { name })} />
					</button>
					<button type="button" onclick={() => move(i, i + 1)} disabled={i === companies.length - 1}>
						<Icon name="down" label={t('form.list.down', { name })} />
					</button>
					<button type="button" onclick={() => companies.splice(i, 1)}>
						<Icon name="close" label={t('form.list.remove', { name })} />
					</button>
				</li>
			{/each}
		</ol>
	{:else}
		<p><small>{t('form.list.empty')}</small></p>
	{/if}
</jl-list-company-order>

<style>
	jl-list-company-order {
		display: block;
		margin-top: var(--space-m);
	}
	ol {
		counter-reset: company;
	}
	li {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		padding: var(--space-xs) 0;
		border-bottom: var(--border);
		counter-increment: company;
	}
	li::before {
		content: counter(company);
		min-width: var(--space-l);
		color: var(--color-muted);
		font-size: var(--font-size-small);
		font-variant-numeric: tabular-nums;
	}
	span {
		flex: 1;
		min-width: 0;
		margin-inline-start: var(--space-xs);
	}
	small {
		display: block;
	}
	button {
		min-width: var(--tap-size);
		padding: 0;
		border-color: transparent;
	}
	p {
		margin: 0;
		padding: var(--space-m);
		border: var(--border-dashed);
		border-radius: var(--radius);
	}
</style>
