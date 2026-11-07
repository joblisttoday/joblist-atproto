<script>
	import config from '#lib/data/config.json';
	import CompanyMark from './CompanyMark.svelte';
	import Icon from './Icon.svelte';
	import { data } from '#lib/network/network.svelte.js';
	import { jobCounts } from '#lib/network/job-counts.svelte.js';
	import { findCompanies } from '#lib/models/list-form.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Find companies and add them with a tap: each shows its picture, where it is and its open jobs.
	 * What is typed stays, to add several from one search.
	 * @type {{companies: string[]}}
	 */
	let { companies = $bindable() } = $props();
	const id = $props.id();
	let query = $state('');
	/** @type {string} */
	let added = $state('');
	const found = $derived(findCompanies(data.companies.values(), companies, query, jobCounts(), config.listForm.suggestions));
	const full = $derived(companies.length >= config.listForm.companiesMax);

	/** @param {import('#lib/models/company.js').Company} company */
	function add(company) {
		if (full) return;
		companies.push(company.key);
		added = company.name;
	}
	/** @param {import('#lib/models/company.js').Company} company */
	const where = (company) => [...new Set(company.locations.map((l) => l.name).filter(Boolean))].slice(0, 2).join(', ');
</script>

<jl-list-company-picker>
	<label for="{id}-search">{t('form.list.add')}</label>
	<input
		id="{id}-search"
		type="search"
		bind:value={query}
		placeholder={t('search.companies')}
		autocomplete="off"
		enterkeyhint="search"
		aria-describedby="{id}-help"
		aria-controls="{id}-found"
	/>
	{#if query.trim() && !found.length}
		<small id="{id}-help">{t('form.list.noMatch')} <a href="/add?url={encodeURIComponent(query.trim())}">{t('company.describe')}</a></small>
	{:else if !query.trim() && found.length}
		<small id="{id}-help">{t('form.list.add.hiring')}</small>
	{:else}
		<small id="{id}-help">{t('form.list.add.help')}</small>
	{/if}
	<ul id="{id}-found" aria-label={t('form.list.suggestions')}>
		{#each found as company (company.key)}
			{@const jobs = jobCounts().get(company.key) || 0}
			<li>
				<button type="button" onclick={() => add(company)} disabled={full}>
					<CompanyMark key={company.key} name={company.name} />
					<span>
						{company.name}
						<small>{[company.key, where(company)].filter(Boolean).join(' · ')}</small>
					</span>
					{#if jobs}<data value={jobs}>{t('jobs.count', { count: jobs })}</data>{/if}
					<Icon name="add" label={t('form.list.addOne', { name: company.name })} />
				</button>
			</li>
		{/each}
	</ul>
	<p aria-live="polite"><small>{added ? t('form.list.added', { name: added }) : ''}</small></p>
</jl-list-company-picker>

<style>
	jl-list-company-picker {
		display: block;
	}
	ul {
		margin: var(--space-s) 0 0;
		border-radius: var(--radius);
		overflow: hidden;
	}
	ul:not(:empty) {
		border: var(--border);
	}
	button {
		display: flex;
		align-items: center;
		gap: var(--space-s);
		width: 100%;
		text-align: start;
		border: none;
		border-bottom: var(--border);
		border-radius: 0;
	}
	li:last-child button {
		border-bottom: none;
	}
	span {
		flex: 1;
		min-width: 0;
	}
	span small {
		display: block;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	data {
		flex: none;
		font-size: var(--font-size-small);
		color: var(--color-muted);
	}
	p {
		margin: var(--space-xs) 0 0;
	}
</style>
