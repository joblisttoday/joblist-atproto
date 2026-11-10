<script>
	import { goto } from '$app/navigation';
	import config from '#lib/data/config.json';
	import Icon from '#lib/components/Icon.svelte';
	import MenuLinks from '#lib/components/MenuLinks.svelte';
	import { searchKeys, searchState } from '#lib/models/saved-search.js';
	import { addressOf, signingIn } from '#lib/navigation/address.js';
	import { own } from '#lib/network/own-lists.svelte.js';
	import { savedJobs } from '#lib/network/saved-jobs.svelte.js';
	import { searches } from '#lib/network/saved-searches.svelte.js';
	import { formatNumber, t } from '#lib/i18n/index.svelte.js';

	/**
	 * The home: what joblist is, a search, and the ways in. Someone who keeps searches or
	 * lists gets one line about them, leading to /me. The explorer is /jobs; an older link
	 * to a search here (/#q=design) goes on to it.
	 */
	const explorer = [...searchKeys, 'view', config.jobs.jobParam];
	$effect(() => {
		if (signingIn()) return;
		const hash = new URLSearchParams(location.hash.slice(1));
		const query = new URLSearchParams(location.search);
		if (explorer.some((key) => hash.has(key) || query.has(key))) goto(`/jobs${location.search}${location.hash}`, { replace: true });
	});

	let what = $state('');
	let where = $state('');
	const fresh = $derived(savedJobs.fresh);
	const yours = $derived(searches.list.length > 0 || own.lists.some((l) => l.count));

	/** @param {SubmitEvent} event */
	function search(event) {
		event.preventDefault();
		goto(addressOf(searchState({ query: what.trim(), where: where.trim(), remote: '' }), '/jobs'));
	}

	/** @type {import('#lib/navigation/nav.js').MenuLink[]} */
	const ways = $derived([
		{ href: '/in', icon: 'place', label: t('landing.cities') },
		{ href: '/field', icon: 'jobs', label: t('landing.fields') },
		{ href: '/companies', icon: 'companies', label: t('nav.companies') },
		{ href: '/lists', icon: 'lists', label: t('home.lists') }
	]);
</script>

<svelte:head><title>{config.name}</title></svelte:head>

<jl-home>
	<h1>{t('home.heading')}</h1>
	<p>{t('home.lead')}</p>

	<form role="search" onsubmit={search}>
		<label>{t('jobs.filter.what')} <input type="search" bind:value={what} enterkeyhint="search" /></label>
		<label>{t('jobs.filter.where')} <input type="search" bind:value={where} enterkeyhint="search" /></label>
		<button type="submit"><Icon name="search" /> {t('saved.explore')}</button>
	</form>

	{#if yours}
		<p data-yours>
			<a href="/me">
				<Icon name="saved" />
				<span>{fresh ? t('home.yours.new', { count: formatNumber(fresh) }) : t('home.yours')}</span>
				<Icon name="next" />
			</a>
		</p>
	{/if}

	<MenuLinks label={t('menu.explore')} items={ways} />
</jl-home>

<style>
	/* One column to scan, as wide as a phone even on a desktop. */
	jl-home {
		display: block;
		max-width: var(--reading-width);
		margin-inline: auto;
		padding: var(--space-l) 0 var(--space-xl);
	}
	h1 {
		margin: 0;
	}
	h1 + p {
		color: var(--color-muted);
	}
	form {
		display: grid;
		gap: var(--space-s);
		margin-top: var(--space-m);
	}
	label {
		display: grid;
		gap: var(--space-xs);
	}
	button {
		justify-self: start;
		background: var(--color-accent);
		color: var(--color-accent-fg);
		border-color: var(--color-accent);
	}
	[data-yours] {
		max-width: none;
		margin-top: var(--space-l);
	}
	[data-yours] a {
		display: flex;
		align-items: center;
		gap: var(--space-s);
		min-height: var(--tap-size);
		padding: var(--space-xs) var(--space-m);
		border: var(--border);
		border-radius: var(--radius);
		color: var(--color-fg);
		text-decoration: none;
	}
	[data-yours] span {
		flex: 1;
	}
</style>
