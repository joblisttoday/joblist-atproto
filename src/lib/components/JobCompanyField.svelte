<script>
	import { data } from '#lib/network/network.svelte.js';
	import { searchCompanies } from '#lib/models/company.js';
	import { t } from '#lib/i18n/index.svelte.js';

	const RESULTS = 8;

	/**
	 * The company a job is for: an existing one, or a link to describe it first
	 * (the add page comes back here with ?company=key).
	 * @type {{company: string, back: string, locked?: boolean}}
	 */
	let { company = $bindable(), back, locked = false } = $props();
	let query = $state('');

	const chosen = $derived(company ? data.companies.get(company) : undefined);
	const results = $derived(searchCompanies(data.companies.values(), query, RESULTS));
	const describe = $derived(`/add?${new URLSearchParams({ url: query, next: back })}`);
</script>

<jl-job-company chosen={company ? true : undefined}>
	<fieldset>
		<legend>{t('post.company')}</legend>
		{#if company}
			<p>
				<a href="/company/{company}">{chosen?.name || company}</a> <small>{company}</small>
				{#if !locked}<button type="button" onclick={() => (company = '')}>{t('post.company.change')}</button>{/if}
			</p>
		{:else}
			<input
				type="search"
				bind:value={query}
				placeholder={t('post.company.search')}
				aria-label={t('post.company.search')}
				autocomplete="off"
				enterkeyhint="search"
				aria-describedby="job-company-help"
			/>
			<small id="job-company-help">
				{t('post.company.help')}
				{t('post.company.missing')} <a href={describe}>{t('post.company.describe')}</a>
			</small>
			{#if results.length}
				<ul>
					{#each results as found (found.key)}
						<li>
							<button type="button" onclick={() => (company = found.key)}>
								<span>{found.name}</span> <small>{found.key}</small>
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		{/if}
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
	ul {
		margin: var(--space-s) 0 0;
		border: var(--border);
		border-radius: var(--radius);
		overflow: hidden;
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
