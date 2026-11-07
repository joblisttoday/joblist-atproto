<script>
	import CompanyMark from './CompanyMark.svelte';
	import Icon from './Icon.svelte';
	import { data } from '#lib/network/network.svelte.js';
	import { jobCounts } from '#lib/network/job-counts.svelte.js';
	import { moveItem } from '#lib/models/list-form.js';
	import { focusNear } from '#lib/navigation/focus.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * The companies of the list, in its order: move one up or down, or remove it.
	 * @type {{companies: string[]}}
	 */
	let { companies = $bindable() } = $props();

	/** @type {HTMLOListElement | undefined} */
	let list = $state();
	/** @type {HTMLParagraphElement | undefined} */
	let empty = $state();

	/**
	 * Moved, the keyboard follows the company (its other arrow once at an end).
	 * @param {number} from @param {number} to @param {'up' | 'down'} way
	 */
	function move(from, to, way) {
		companies = moveItem(companies, from, to);
		focusNear(() => list, to, [`button[data-move=${way}]:not(:disabled)`, 'button[data-move]:not(:disabled)']);
	}

	/** Removed, the keyboard goes to the company now at its place, or the empty list. @param {number} i */
	function remove(i) {
		companies.splice(i, 1);
		focusNear(() => list, i, 'button[data-remove]', () => empty);
	}
</script>

<jl-list-company-order count={companies.length}>
	{#if companies.length}
		<ol bind:this={list}>
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
					<button type="button" data-move="up" onclick={() => move(i, i - 1, 'up')} disabled={i === 0}>
						<Icon name="up" label={t('form.list.up', { name })} />
					</button>
					<button type="button" data-move="down" onclick={() => move(i, i + 1, 'down')} disabled={i === companies.length - 1}>
						<Icon name="down" label={t('form.list.down', { name })} />
					</button>
					<button type="button" data-remove onclick={() => remove(i)}>
						<Icon name="close" label={t('form.list.remove', { name })} />
					</button>
				</li>
			{/each}
		</ol>
	{:else}
		<p bind:this={empty} tabindex="-1"><small>{t('form.list.empty')}</small></p>
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
