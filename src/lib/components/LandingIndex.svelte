<script>
	import CompanyMap from './CompanyMap.svelte';
	import FollowFeed from './FollowFeed.svelte';
	import PageHeader from './PageHeader.svelte';
	import Pending from './Pending.svelte';
	import ViewSwitch from './ViewSwitch.svelte';
	import { replaceState } from '$app/navigation';
	import config from '#lib/data/config.json';
	import { landingPath } from '#lib/models/landing.js';
	import { keepAddress, readAddress } from '#lib/navigation/address.js';
	import { readView, viewParam } from '#lib/navigation/explore-view.js';
	import { getLandingIndex } from '#lib/network/landing.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Every city (/in) or every field (/field) with a page, the most jobs first: as a list,
	 * a grid, or (cities, which have a place) a map. The view is in the address (#view=map).
	 * @type {{by: 'city' | 'field'}}
	 */
	let { by } = $props();
	const page = $derived(by === 'city' ? 'cities' : 'fields');
	/** @type {import('#lib/navigation/explore-view.js').ExploreView[]} */
	const views = $derived(by === 'city' ? ['list', 'grid', 'map'] : ['list', 'grid']);
	const title = $derived(t(by === 'city' ? 'landing.cities' : 'landing.fields'));
	const intro = $derived(t(by === 'city' ? 'landing.cities.intro' : 'landing.fields.intro'));
	const index = getLandingIndex();

	/** @param {string | null} asked */
	const allowed = (asked) => {
		const v = viewParam(asked);
		return v && views.includes(v) ? v : null;
	};
	// /in and /field are two routes: each page starts with its own.
	// svelte-ignore state_referenced_locally
	let view = $state(allowed(readAddress(['view']).get('view')) || allowed(readView(page, 'grid')) || 'grid');
	$effect(() => keepAddress({ view: view === 'grid' ? '' : view }, (url) => replaceState(url, {})));

	/** The cities on the map: a tap leads to its page. @param {import('#lib/models/landing.js').LandingIndex | null} found */
	const cityPoints = (found) =>
		(found?.cities || [])
			.filter((c) => c.g)
			.map((c) => ({
				lon: /** @type {[number, number]} */ (c.g)[0],
				lat: /** @type {[number, number]} */ (c.g)[1],
				company: { key: c.slug, name: `${c.name} · ${t('landing.count', { count: c.count })}` },
				href: landingPath({ city: c.slug })
			}));
</script>

<svelte:head><title>{title} · {config.name}</title></svelte:head>

<jl-landing-index {view}>
	<nav><a href="/in">{t('landing.cities')}</a> · <a href="/field">{t('landing.fields')}</a></nav>
	<PageHeader {title} {intro}>
		{#snippet actions()}<ViewSwitch bind:view {page} {views} /><FollowFeed feed={{}} />{/snippet}
	</PageHeader>
	{#await index}
		<Pending />
	{:then found}
		{#if view === 'map'}
			<jl-landing-map><CompanyMap places={cityPoints(found)} full /></jl-landing-map>
		{:else}
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
		{/if}
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
	jl-landing-index[view='list'] ul {
		grid-template-columns: 1fr;
	}
	jl-landing-map {
		display: block;
		height: var(--map-height);
		margin: var(--space-s) calc(-1 * var(--gutter)) 0;
	}
	jl-landing-map :global(jl-map),
	jl-landing-map :global(figure) {
		height: 100%;
	}
	@media (min-width: 64rem) {
		jl-landing-map {
			margin-inline: 0;
			border-radius: var(--radius-large);
			overflow: hidden;
		}
	}
</style>
