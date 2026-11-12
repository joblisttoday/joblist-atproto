<script>
	import { tick } from 'svelte';
	import { data } from '#lib/network/network.svelte.js';
	import { searchCompanies } from '#lib/models/company.js';
	import { t } from '#lib/i18n/index.svelte.js';

	const RESULTS = 8;

	/**
	 * The company a job is for: an existing one, or a link to describe it first
	 * (the add page comes back here with ?company=key).
	 * `missing`: the form was sent without one, said here as an error.
	 * @type {{company: string, back: string, locked?: boolean, missing?: boolean}}
	 */
	let { company = $bindable(), back, locked = false, missing = false } = $props();
	const id = $props.id();
	let query = $state('');
	/** A company just chosen, said to screen readers. */
	let picked = $state('');
	/** @type {HTMLInputElement | undefined} */
	let search = $state();
	/** @type {HTMLButtonElement | undefined} */
	let change = $state();

	const chosen = $derived(company ? data.companies.get(company) : undefined);
	const results = $derived(searchCompanies(data.companies.values(), query, RESULTS));
	const describe = $derived(`/org/page?${new URLSearchParams({ url: query, next: back })}`);
	// One status, always there, so each change of the results is heard.
	const said = $derived(
		company ? (picked ? t('post.company.chosen', { name: picked }) : '') : query.trim() ? t('post.company.found', { count: results.length }) : ''
	);

	/** The keyboard goes to the search (the form calls it when sent without a company). */
	export function focus() {
		search?.focus();
	}

	/** @param {{key: string, name: string}} found */
	async function pick(found) {
		company = found.key;
		picked = found.name;
		await tick();
		change?.focus();
	}

	async function unpick() {
		company = '';
		picked = '';
		await tick();
		search?.focus();
	}
</script>

<jl-job-company chosen={company ? true : undefined}>
	<fieldset>
		<legend data-required>{t('post.company')}</legend>
		{#if company}
			<p>
				<a href="/{company}">{chosen?.name || company}</a> <small>{company}</small>
				{#if !locked}<button type="button" bind:this={change} onclick={unpick}>{t('post.company.change')}</button>{/if}
			</p>
		{:else}
			<input
				bind:this={search}
				type="search"
				bind:value={query}
				placeholder={t('post.company.search')}
				aria-label={t('post.company.search')}
				autocomplete="off"
				enterkeyhint="search"
				aria-invalid={missing || undefined}
				aria-describedby="{missing ? `${id}-error ` : ''}{id}-help"
				aria-controls="{id}-results"
			/>
			{#if missing}<p id="{id}-error" role="alert">{t('post.company.required')}</p>{/if}
			<small id="{id}-help">
				{t('post.company.help')}
				{t('post.company.missing')} <a href={describe}>{t('post.company.describe')}</a>
			</small>
			<ul id="{id}-results" aria-label={t('post.company.results')}>
				{#each results as found (found.key)}
					<li>
						<button type="button" onclick={() => pick(found)}>
							<span>{found.name}</span> <small>{found.key}</small>
						</button>
					</li>
				{/each}
			</ul>
		{/if}
		<p role="status"><small>{said}</small></p>
	</fieldset>
</jl-job-company>

<style>
	p {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-s);
		margin: var(--space-s) 0 0;
	}
	p[role='status']:has(small:empty) {
		margin: 0;
	}
	ul {
		margin: var(--space-s) 0 0;
		border-radius: var(--radius);
		overflow: hidden;
	}
	ul:not(:empty) {
		border: var(--border);
	}
	ul button {
		width: 100%;
		justify-content: space-between;
		text-align: left;
		border: none;
		border-bottom: var(--border);
		border-radius: 0;
	}
	ul li:last-child button {
		border-bottom: none;
	}
</style>
