<script>
	import Icon from './Icon.svelte';
	import JobItem from './JobItem.svelte';
	import JobsDialog from './JobsDialog.svelte';
	import { openJob, showJob } from '#lib/navigation/job-open.svelte.js';
	import JobsMap from './JobsMap.svelte';
	import ViewSwitch from './ViewSwitch.svelte';
	import { pageView } from '#lib/navigation/page-view.svelte.js';
	import PageHeader from './PageHeader.svelte';
	import PageMenu from './PageMenu.svelte';
	import DataState from './DataState.svelte';
	import Empty from './Empty.svelte';
	import config from '#lib/data/config.json';
	import { page as route } from '$app/state';
	import { explorerPath, landingPath, pageNumber, pagedPath } from '#lib/models/landing.js';
	import { getLandingPage } from '#lib/network/landing.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * The newest jobs of a city, a field, or a field in a city (/in/berlin/design),
	 * and pages of older ones (?page=2), from the same files the Worker made this page's HTML from:
	 * as a list, a grid or on a map (their places are in the file). The view is in the address (#view=map).
	 * @type {{city?: string, field?: string}}
	 */
	let { city, field } = $props();
	/** The page's file; undefined while it loads, null when there is none. */
	let page = $state.raw(/** @type {Awaited<ReturnType<typeof getLandingPage>> | undefined} */ (undefined));
	// The snapshot did not answer: nothing can be said of this page (not that it has none).
	let failed = $state(false);
	const number = $derived(pageNumber(route.url.searchParams.get('page')) || 1);
	$effect(() => {
		const asked = number;
		page = undefined;
		failed = false;
		getLandingPage({ city, field, page: asked })
			.then((found) => asked === number && (page = found))
			.catch(() => asked === number && (failed = true));
	});
	const pages = $derived(Math.max(number, page?.pages || 1));
	const shown = pageView('landing');
	const names = $derived(new Map(Object.entries(page?.names || {})));
	const mapless = $derived(!page?.jobs.some((j) => j.point));
	const nth = $derived(number > 1 ? ` · ${t('landing.page', { page: number, pages })}` : '');
	const fieldName = $derived(field ? t(`field.${field}`) : '');
	const cityName = $derived(page?.name || city || '');

	/** @param {string} cityName */
	function title(cityName) {
		if (city && field) return t('landing.cityField', { city: cityName, field: fieldName });
		if (city) return t('landing.city', { city: cityName });
		return t('landing.field', { field: fieldName });
	}
</script>

<svelte:head><title>{title(cityName)}{nth} · {config.name}</title></svelte:head>

{#if failed || page === undefined}
	<DataState state={failed ? 'unreachable' : 'reading'} />
{:else if page}
		<jl-landing-page view={shown.view}>
			<nav><a href="/in">{t('landing.cities')}</a> · <a href="/field">{t('landing.fields')}</a></nav>
			<PageHeader title={title(cityName)} intro={t('landing.intro', { count: page.count })}>
				{#snippet actions()}<ViewSwitch bind:view={shown.view} page="landing" {mapless} /><PageMenu feed={{ city, field }} />{/snippet}
			</PageHeader>
			<p><a href={explorerPath({ cityName: city ? cityName : '', field })}><Icon name="map" /> {t('landing.explore')}</a></p>
			{#if shown.view === 'map' && !mapless}
				<jl-landing-map><JobsMap jobs={page.jobs} {names} fit /></jl-landing-map>
			{:else}
				<ul>
					{#each page.jobs as job (job.url)}
						<li><JobItem {job} company={page.names[job.company] || job.company} onselect={() => showJob(job)} selected={openJob()?.url === job.url} /></li>
					{/each}
				</ul>
			{/if}
			{#if pages > 1}
				<nav>
					{#if number > 1}<a href={pagedPath({ city, field, page: number - 1 })} rel="prev">{t('landing.newer')}</a> ·{/if}
					{t('landing.page', { page: number, pages })}
					{#if number < pages}· <a href={pagedPath({ city, field, page: number + 1 })} rel="next">{t('landing.older')}</a>{/if}
				</nav>
			{/if}
			{#if page.fields?.length && !field}
				<section aria-labelledby="landing-by">
					<h2 id="landing-by">{t('landing.byField')}</h2>
					<ul>
						{#each page.fields as f (f.slug)}
							<li><a href={landingPath({ city, field: f.slug })}>{t(`field.${f.slug}`)}</a> <small>{t('landing.count', { count: f.count })}</small></li>
						{/each}
					</ul>
				</section>
			{:else if page.cities?.length}
				<section aria-labelledby="landing-by">
					<h2 id="landing-by">{t('landing.byCity')}</h2>
					<ul>
						{#each page.cities as c (c.slug)}
							<li><a href={landingPath({ city: c.slug, field })}>{c.name}</a> <small>{t('landing.count', { count: c.count })}</small></li>
						{/each}
					</ul>
				</section>
			{/if}
			<JobsDialog jobs={page.jobs} {names} />
		</jl-landing-page>
{:else}
	<!-- No page here (too few jobs): what it would be, why not, and where its jobs still are. -->
	<jl-landing-page>
		<nav><a href="/in">{t('landing.cities')}</a> · <a href="/field">{t('landing.fields')}</a></nav>
		<PageHeader title={title(cityName)} />
		<Empty text={t('landing.notFound')}>
			<a href={explorerPath({ cityName: city ? cityName : '', field })}><Icon name="search" /> {t('saved.explore')}</a>
			<a href={city ? '/in' : '/field'}>{t(city ? 'landing.cities' : 'landing.fields')}</a>
		</Empty>
	</jl-landing-page>
{/if}

<style>
	jl-landing-page {
		display: block;
	}
	nav {
		padding-top: var(--space-s);
		font-size: var(--font-size-small);
	}
	jl-landing-page > ul {
		display: grid;
		grid-template-columns: var(--columns);
		column-gap: var(--column-gap);
		padding: 0;
		list-style: none;
	}
	jl-landing-page[view='list'] > ul {
		grid-template-columns: 1fr;
	}
	jl-landing-map {
		display: block;
		height: var(--map-height);
		margin: var(--space-s) calc(-1 * var(--gutter)) 0;
	}
	@media (min-width: 64rem) {
		jl-landing-map {
			margin-inline: 0;
			border-radius: var(--radius-large);
			overflow: hidden;
		}
	}
	section {
		margin-top: var(--space-xl);
	}
	section ul {
		display: grid;
		grid-template-columns: var(--columns);
		gap: var(--space-s) var(--column-gap);
		padding: 0;
		list-style: none;
	}
</style>
