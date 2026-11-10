<script>
	import Icon from './Icon.svelte';
	import config from '#lib/data/config.json';
	import { afterNavigate, goto } from '$app/navigation';
	import { quickResults } from '#lib/models/quick-search.js';
	import { landingPath } from '#lib/models/landing.js';
	import { searchState } from '#lib/models/saved-search.js';
	import { addressOf } from '#lib/navigation/address.js';
	import { handleOf } from '#lib/network/network.svelte.js';
	import { readSources, sources } from '#lib/network/quick-search.svelte.js';
	import { accountOf, thumbnail } from '#lib/network/accounts.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * The search box of every page: Enter searches jobs in the explorer; as one
	 * types, it also offers the places, companies and lists that match.
	 * On phones it is a button that opens the box over the header.
	 */
	let text = $state('');
	let open = $state(false);
	/** @type {HTMLInputElement | undefined} */
	let input = $state();
	/** @type {HTMLElement | undefined} */
	let box = $state();

	const found = $derived(quickResults(text, sources, config.quickSearch.shown));
	const typed = $derived(text.trim().length >= 2);
	/** @param {Partial<import('#lib/models/job.js').JobFilters>} filters */
	const jobsPath = (filters) => addressOf(searchState({ query: '', where: '', remote: '', ...filters }), '/jobs');

	afterNavigate(() => {
		text = '';
		open = false;
	});

	/** @param {SubmitEvent} event */
	function submit(event) {
		event.preventDefault();
		if (text.trim()) goto(jobsPath({ query: text.trim() }));
	}

	function show() {
		open = true;
		readSources();
		queueMicrotask(() => input?.focus());
	}

	/** Arrows move through the offers, Escape closes. @param {KeyboardEvent} event */
	function keys(event) {
		if (event.key === 'Escape') {
			text ? (text = '') : (open = false);
			input?.focus();
			return;
		}
		if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
		const links = [...(box?.querySelectorAll('ul a') || [])];
		if (!links.length) return;
		event.preventDefault();
		const at = links.indexOf(/** @type {Element} */ (document.activeElement));
		const next = event.key === 'ArrowDown' ? at + 1 : at - 1;
		if (next < 0) input?.focus();
		else /** @type {HTMLElement} */ (links[Math.min(next, links.length - 1)]).focus();
	}

	/** Leaving the box closes its offers. @param {FocusEvent} event */
	function leave(event) {
		if (!box?.contains(/** @type {Node | null} */ (event.relatedTarget))) open = false;
	}
</script>

<jl-search bind:this={box} open={open || undefined} onfocusout={leave}>
	<button type="button" aria-expanded={open} onclick={show}><Icon name="search" label={t('quick.label')} /></button>
	<form role="search" onsubmit={submit}>
		<Icon name="search" />
		<input
			bind:this={input}
			bind:value={text}
			type="search"
			placeholder={t('quick.placeholder')}
			aria-label={t('quick.placeholder')}
			enterkeyhint="search"
			autocomplete="off"
			onkeydown={keys}
			onfocus={() => ((open = true), readSources())}
		/>
		<button type="button" onclick={() => (open = false)}><Icon name="close" label={t('quick.close')} /></button>
	</form>
	{#if open && typed}
		<ul>
			<li><a onkeydown={keys} href={jobsPath({ query: text.trim() })}><Icon name="search" /> {t('quick.jobs', { text: text.trim() })}</a></li>
			{#each found.fields as field (field.slug)}
				<li>
					<a onkeydown={keys} href={landingPath({ field: field.slug })}>
						<Icon name="jobs" /> {t('landing.field', { field: field.name })} <small>{t('landing.count', { count: field.count })}</small>
					</a>
				</li>
			{/each}
			{#each found.cities as city (city.slug)}
				<li>
					<a onkeydown={keys} href={landingPath({ city: city.slug })}>
						<Icon name="place" /> {t('landing.city', { city: city.name })} <small>{t('landing.count', { count: city.count })}</small>
					</a>
				</li>
			{/each}
			{#each found.places as place (place)}
				<li><a onkeydown={keys} href={jobsPath({ where: place })}><Icon name="place" /> {t('quick.place', { place })}</a></li>
			{/each}
			{#each found.companies as company (company.key)}
				{@const avatar = accountOf(company.key)?.avatar}
				{@const jobs = sources.counts.get(company.key)}
				<li>
					<a onkeydown={keys} href="/company/{company.key}">
						{#if avatar}<img src={thumbnail(avatar)} alt="" />{:else}<Icon name="companies" />{/if}
						{company.name}
						{#if jobs}<small>{t('jobs.count', { count: jobs })}</small>{/if}
					</a>
				</li>
			{/each}
			{#each found.lists as list (list.uri)}
				<li>
					<a onkeydown={keys} href="/{handleOf(list.did)}/{list.rkey}">
						<Icon name="lists" />
						{list.name}
						<small>{t('list.companies', { count: list.companies.length })}</small>
					</a>
				</li>
			{/each}
		</ul>
	{/if}
</jl-search>

<style>
	jl-search {
		position: relative;
		display: flex;
		align-items: center;
		flex: 1;
		justify-content: flex-end;
		min-width: 0;
	}
	jl-search > button {
		min-width: var(--tap-size);
		border: 0;
		background: none;
	}
	form {
		display: none;
		align-items: center;
		gap: var(--space-xs);
		width: 100%;
		padding-inline-start: var(--space-s);
		border: var(--border);
		border-radius: var(--radius-round);
		background: var(--color-bg);
		color: var(--color-muted);
	}
	input {
		flex: 1;
		min-width: 0;
		border: 0;
		background: none;
		padding-inline: 0;
	}
	input:focus {
		outline: none;
	}
	/* Its own close button says it: no second one from the browser. */
	input::-webkit-search-cancel-button {
		display: none;
	}
	form:focus-within {
		outline: var(--focus-ring);
	}
	form button {
		min-height: var(--chip-height);
		min-width: var(--tap-size);
		border: 0;
		background: none;
	}
	/* Phones: the button opens the box over the header. */
	jl-search[open] {
		position: absolute;
		inset: 0;
		z-index: 1;
		padding: 0 var(--gutter);
		background: var(--color-bg);
	}
	jl-search[open] > button {
		display: none;
	}
	jl-search[open] form {
		display: flex;
	}
	ul {
		position: absolute;
		top: 100%;
		inset-inline: 0;
		margin: 0;
		padding: var(--space-xs) 0;
		list-style: none;
		background: var(--color-bg);
		border-bottom: var(--border);
		box-shadow: var(--shadow);
	}
	ul a {
		display: flex;
		align-items: center;
		gap: var(--space-s);
		min-height: var(--tap-size);
		padding: 0 var(--gutter);
		color: var(--color-fg);
		text-decoration: none;
	}
	ul a:hover,
	ul a:focus {
		background: var(--color-soft);
	}
	ul small {
		margin-inline-start: auto;
		color: var(--color-muted);
	}
	img {
		width: var(--icon-avatar);
		height: var(--icon-avatar);
		border-radius: var(--radius);
		object-fit: cover;
	}

	/* Wide screens: always a box in the header, its offers under it. */
	@media (min-width: 64rem) {
		jl-search,
		jl-search[open] {
			position: relative;
			inset: auto;
			padding: 0;
			max-width: var(--search-width);
		}
		jl-search > button,
		form button {
			display: none;
		}
		form {
			display: flex;
		}
		ul {
			border: var(--border);
			border-radius: var(--radius);
			margin-top: var(--space-xs);
		}
		ul a {
			padding: 0 var(--space-m);
		}
	}
</style>
