<script>
	import { page } from '$app/state';
	import { data, handleOf } from '#lib/network/network.svelte.js';
	import { suggest } from '#lib/network/save-suggestion.js';
	import { searchCompanies } from '#lib/models/company.js';
	import { t } from '#lib/i18n/index.svelte.js';

	const RESULTS = 8;

	/**
	 * "Suggest a company" for someone else's list, for a signed-in person.
	 * @type {{list: import('#lib/models/list.js').List, taken: Set<string>, onclose: () => void}}
	 */
	let { list, taken, onclose } = $props();

	// Back from describing a new company: it comes preselected (?suggest=key).
	const preselected = page.url.searchParams.get('suggest') || '';
	let chosen = $state(preselected);
	let query = $state('');
	let note = $state('');
	let busy = $state(false);
	let sent = $state(false);
	/** @type {string | null} */
	let error = $state(null);

	const path = $derived(`/${handleOf(list.did)}/${list.rkey}`);
	const results = $derived(
		searchCompanies(
			[...data.companies.values()].filter((c) => !taken.has(c.key)),
			query,
			RESULTS
		)
	);

	/** @param {SubmitEvent} event */
	async function send(event) {
		event.preventDefault();
		busy = true;
		error = null;
		try {
			await suggest({ list: list.uri, company: chosen, note });
			sent = true;
			chosen = '';
			query = '';
			note = '';
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
		} finally {
			busy = false;
		}
	}
</script>

<jl-list-suggest open={list.open || undefined}>
	<section aria-label={t('suggestion.title')}>
		{#if chosen}
			<form onsubmit={send}>
				<p>{t('suggestion.chosen', { name: data.companies.get(chosen)?.name || chosen })}</p>
				<label for="suggest-note">{t('suggestion.note')}</label>
				<textarea id="suggest-note" bind:value={note} maxlength="300"></textarea>
				{#if error}<p role="alert">{error}</p>{/if}
				<menu>
					<button type="submit" disabled={busy}>{busy ? t('form.saving') : t('suggestion.send')}</button>
					<button type="button" onclick={() => (chosen = '')}>{t('form.cancel')}</button>
				</menu>
			</form>
		{:else}
			{#if sent}<p role="status">{list.open ? t('suggestion.sent.open') : t('suggestion.sent')}</p>{/if}
			<label for="suggest-search">{t('suggestion.search')}</label>
			<input
				id="suggest-search"
				type="search"
				bind:value={query}
				placeholder={t('search.companies')}
				autocomplete="off"
				enterkeyhint="search"
				aria-describedby="suggest-help"
			/>
			{#if query && !results.length}
				<small id="suggest-help">
					{t('form.list.noMatch')}
					<a href="/add?url={encodeURIComponent(query)}&list={encodeURIComponent(path)}">{t('company.describe')}</a>
				</small>
			{:else}
				<small id="suggest-help">{list.open ? t('suggestion.help.open') : t('suggestion.help')}</small>
			{/if}
			{#if results.length}
				<ul aria-label={t('form.list.suggestions')}>
					{#each results as company (company.key)}
						<li>
							<button type="button" onclick={() => (chosen = company.key)}>
								<span>+ {company.name}</span> <small>{company.key}</small>
							</button>
						</li>
					{/each}
				</ul>
			{/if}
			<menu><button type="button" onclick={onclose}>{t('suggestion.close')}</button></menu>
		{/if}
	</section>
</jl-list-suggest>

<style>
	jl-list-suggest {
		display: block;
		margin: var(--space-m) 0;
		padding: 0 var(--space-m);
		border: var(--border);
		border-radius: var(--radius);
	}
	section {
		padding: var(--space-s) 0 0;
	}
	label:first-of-type {
		margin-top: var(--space-s);
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
	[role='status'] {
		color: var(--color-ok);
	}
</style>
