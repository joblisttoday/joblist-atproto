<script>
	import config from '#lib/data/config.json';
	import CompanyMark from './CompanyMark.svelte';
	import Icon from './Icon.svelte';
	import { data } from '#lib/network/network.svelte.js';
	import { jobCounts } from '#lib/network/job-counts.svelte.js';
	import { findCompanies, readPasted } from '#lib/models/list-form.js';
	import { focusNear } from '#lib/navigation/focus.js';
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

	/** @type {HTMLUListElement | undefined} */
	let list = $state();
	/** @type {HTMLInputElement | undefined} */
	let search = $state();

	/**
	 * Added, it leaves the suggestions: the keyboard goes on to the next one, or back to the search.
	 * @param {import('#lib/models/company.js').Company} company
	 * @param {number} index
	 */
	function add(company, index) {
		if (full) return;
		companies.push(company.key);
		added = company.name;
		focusNear(() => list, index, 'button:not(:disabled)', () => search);
	}
	// Several at once: websites or links pasted, one a line.
	let paste = $state('');
	const pasted = $derived(readPasted(paste, data.companies, companies));
	function addAll() {
		const room = config.listForm.companiesMax - companies.length;
		const adding = pasted.found.slice(0, Math.max(0, room));
		companies.push(...adding.map((c) => c.key));
		added = adding.map((c) => c.name).join(', ');
	}

	/** @param {import('#lib/models/company.js').Company} company */
	const where = (company) => [...new Set(company.locations.map((l) => l.name).filter(Boolean))].slice(0, 2).join(', ');
</script>

<jl-list-company-picker>
	<label for="{id}-search">{t('form.list.add')}</label>
	<input
		id="{id}-search"
		bind:this={search}
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
	<ul id="{id}-found" bind:this={list} aria-label={t('form.list.suggestions')}>
		{#each found as company, i (company.key)}
			{@const jobs = jobCounts().get(company.key) || 0}
			<li>
				<button type="button" onclick={() => add(company, i)} disabled={full}>
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
	<details>
		<summary>{t('form.list.paste')}</summary>
		<label for="{id}-paste">{t('form.list.paste.help')}</label>
		<textarea id="{id}-paste" bind:value={paste} rows="4" placeholder={t('form.list.paste.example')}></textarea>
		{#if paste.trim()}
			<p>
				<small>
					{t('form.list.paste.found', { count: pasted.found.length })}{#if pasted.already} · {t('form.list.paste.already', { count: pasted.already })}{/if}
				</small>
			</p>
			{#if pasted.found.length}
				<menu><li><button type="button" onclick={addAll} disabled={full}><Icon name="add" /> {t('form.list.paste.addAll', { count: pasted.found.length })}</button></li></menu>
			{/if}
			{#if pasted.missing.length}
				<p><small>{t('form.list.paste.missing')}</small></p>
				<ul aria-label={t('form.list.paste.missing')}>
					{#each pasted.missing as other (other.link)}
						<li><a href="/add?url={encodeURIComponent(other.link)}" target="_blank" rel="noopener">{other.key || other.link}</a></li>
					{/each}
				</ul>
			{/if}
		{/if}
	</details>
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
	/* The suggestions: rows to tap, not buttons. */
	ul > li > button {
		display: flex;
		align-items: center;
		gap: var(--space-s);
		width: 100%;
		text-align: start;
		border: none;
		border-bottom: var(--border);
		border-radius: 0;
	}
	ul > li:last-child > button {
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
