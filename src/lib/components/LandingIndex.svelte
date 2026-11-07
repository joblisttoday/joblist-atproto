<script>
	import FollowFeed from './FollowFeed.svelte';
	import PageHeader from './PageHeader.svelte';
	import Pending from './Pending.svelte';
	import config from '#lib/data/config.json';
	import { landingPath } from '#lib/models/landing.js';
	import { getLandingIndex } from '#lib/network/landing.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Every city (/in) or every field (/field) with a page, the most jobs first.
	 * @type {{by: 'city' | 'field'}}
	 */
	let { by } = $props();
	const title = $derived(t(by === 'city' ? 'landing.cities' : 'landing.fields'));
	const intro = $derived(t(by === 'city' ? 'landing.cities.intro' : 'landing.fields.intro'));
	const index = getLandingIndex();
</script>

<svelte:head><title>{title} · {config.name}</title></svelte:head>

<jl-landing-index>
	<nav><a href="/in">{t('landing.cities')}</a> · <a href="/field">{t('landing.fields')}</a></nav>
	<PageHeader {title} {intro}>
		{#snippet actions()}<FollowFeed feed={{}} />{/snippet}
	</PageHeader>
	{#await index}
		<Pending />
	{:then found}
		<ul>
			{#if by === 'city'}
				{#each found?.cities || [] as c (c.slug)}
					<li><a href={landingPath({ city: c.slug })}>{c.name}</a> <small>{t('landing.count', { count: c.count })}</small></li>
				{/each}
			{:else}
				{#each [...(found?.fields || [])].sort((a, b) => b.count - a.count) as f (f.slug)}
					<li><a href={landingPath({ field: f.slug })}>{t(`field.${f.slug}`)}</a> <small>{t('landing.count', { count: f.count })}</small></li>
				{/each}
			{/if}
		</ul>
	{/await}
</jl-landing-index>

<style>
	jl-landing-index {
		display: block;
	}
	nav {
		padding-top: var(--space-s);
		font-size: var(--font-size-small);
	}
	ul {
		display: grid;
		grid-template-columns: var(--columns);
		gap: var(--space-s) var(--column-gap);
		padding: 0;
		list-style: none;
	}
</style>
