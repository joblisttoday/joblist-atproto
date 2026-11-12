<script>
	import Icon from './Icon.svelte';
	import config from '#lib/data/config.json';
	import { afterNavigate, goto } from '$app/navigation';
	import { quickResults } from '#lib/models/quick-search.js';
	import { searchState } from '#lib/models/saved-search.js';
	import { addressOf } from '#lib/navigation/address.js';
	import { sources } from '#lib/network/quick-search.svelte.js';
	import { knownBy, organizationPage } from '#lib/models/kept.js';
	import { data } from '#lib/network/network.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * The search box, for jobs and organizations both: a link or a domain (acme.coop,
	 * jobs.lever.co/acme, instagram.com/acme) offers its organization's page first, and Enter
	 * opens it: there joblist reads its job board and Bluesky account, to save it in this
	 * browser. Words offer the saved organizations they name, and Enter searches the jobs of
	 * the saved organizations (/jobs).
	 * In the header, on phones, it is a button that opens the box over the header;
	 * inline (a page's own, the home's), always a box.
	 * placeholder: what the box asks for (by default: search, or paste a link).
	 * @type {{inline?: boolean, placeholder?: string}}
	 */
	let { inline = false, placeholder = '' } = $props();
	let text = $state('');
	let open = $state(false);
	/** @type {HTMLInputElement | undefined} */
	let input = $state();
	/** @type {HTMLElement | undefined} */
	let box = $state();

	const found = $derived(quickResults(text, sources, config.quickSearch.shown));
	const typed = $derived(text.trim().length >= 2);
	const knows = $derived(knownBy(data.companies));
	const organization = $derived(organizationPage(text, knows));
	/** @param {Partial<import('#lib/models/job.js').JobFilters>} filters */
	const jobsPath = (filters) => addressOf(searchState({ query: '', where: '', remote: '', ...filters }), '/');

	afterNavigate(() => {
		text = '';
		open = false;
	});

	/** @param {SubmitEvent} event */
	function submit(event) {
		event.preventDefault();
		if (organization?.sure) goto(organization.href);
		else if (text.trim()) goto(jobsPath({ query: text.trim() }));
	}

	function show() {
		open = true;
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

<jl-search bind:this={box} open={open || undefined} inline={inline || undefined} onfocusout={leave}>
	<button type="button" aria-expanded={open} onclick={show}><Icon name="search" label={t('quick.label')} /></button>
	<form role="search" onsubmit={submit}>
		<Icon name="search" />
		<input
			bind:this={input}
			bind:value={text}
			type="search"
			placeholder={placeholder || t('quick.placeholder')}
			aria-label={placeholder || t('quick.placeholder')}
			enterkeyhint="search"
			autocomplete="off"
			onkeydown={keys}
			onfocus={() => (open = true)}
		/>
		<button type="button" onclick={() => (open = false)}><Icon name="close" label={t('quick.close')} /></button>
	</form>
	{#if open && typed}
		<ul>
			{#if organization?.sure}
				<li>
					<a onkeydown={keys} href={organization.href}>
						<Icon name="companies" /> {t(organization.known ? 'quick.open' : 'quick.find', { name: organization.name })}
					</a>
				</li>
			{/if}
			<li><a onkeydown={keys} href={jobsPath({ query: text.trim() })}><Icon name="search" /> {t('quick.jobs', { text: text.trim() })}</a></li>
			{#each found.companies as company (company.key)}
				<li>
					<a onkeydown={keys} href={company.href}><Icon name="savedOn" /> {company.name}</a>
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

	/* A page's own: always a box, as tall as a field, its offers under it. */
	jl-search[inline],
	jl-search[inline][open] {
		position: relative;
		inset: auto;
		z-index: 2;
		padding: 0;
		justify-content: stretch;
	}
	jl-search[inline] > button,
	jl-search[inline] form button {
		display: none;
	}
	jl-search[inline] form {
		display: flex;
		min-height: var(--tap-size);
		padding-inline: var(--space-m);
	}
	jl-search[inline] ul {
		border: var(--border);
		border-radius: var(--radius);
		margin-top: var(--space-xs);
	}
	jl-search[inline] ul a {
		padding: 0 var(--space-m);
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
		jl-search[inline] {
			max-width: none;
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
