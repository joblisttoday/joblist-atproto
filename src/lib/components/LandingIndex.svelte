<script>
	import CompanyMap from './CompanyMap.svelte';
	import FollowFeed from './FollowFeed.svelte';
	import PageHeader from './PageHeader.svelte';
	import PageMenu from './PageMenu.svelte';
	import DataState from './DataState.svelte';
	import Empty from './Empty.svelte';
	import ViewSwitch from './ViewSwitch.svelte';
	import config from '#lib/data/config.json';
	import { landingPath } from '#lib/models/landing.js';
	import { pageView } from '#lib/navigation/page-view.svelte.js';
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
	// The index: undefined while it is read, null when the snapshot has none.
	let found = $state.raw(/** @type {import('#lib/models/landing.js').LandingIndex | null | undefined} */ (undefined));
	let failed = $state(false);
	getLandingIndex()
		.then((index) => (found = index))
		.catch(() => (failed = true));
	const status = $derived(failed ? 'unreachable' : found === undefined ? 'reading' : 'known');
	// No city has its place yet (a snapshot from before they had one): the map has nothing to show.
	const mapless = $derived(by === 'city' && !found?.cities.some((c) => c.g));

	// /in and /field are two routes: each page starts with its own.
	// svelte-ignore state_referenced_locally
	const shown = pageView(page, views);

	/** The cities on the map: a tap leads to its page. @param {import('#lib/models/landing.js').LandingIndex | null | undefined} found */
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

<jl-landing-index view={shown.view}>
	<nav><a href="/in">{t('landing.cities')}</a> · <a href="/field">{t('landing.fields')}</a></nav>
	<PageHeader {title} {intro}>
		{#snippet actions()}<ViewSwitch bind:view={shown.view} {page} {views} {mapless} /><FollowFeed feed={{}} /><PageMenu />{/snippet}
	</PageHeader>
	<DataState state={status}>
		{#if !(by === 'city' ? found?.cities : found?.fields)?.length}
			<Empty text={t('landing.none')} />
		{:else if shown.view === 'map' && !mapless}
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
	</DataState>
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
