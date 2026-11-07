<script>
	import Icon from './Icon.svelte';
	import FollowFeed from './FollowFeed.svelte';
	import JobItem from './JobItem.svelte';
	import PageHeader from './PageHeader.svelte';
	import Pending from './Pending.svelte';
	import config from '#lib/data/config.json';
	import { explorerPath, landingPath } from '#lib/models/landing.js';
	import { getLandingPage } from '#lib/network/landing.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * The newest jobs of a city, a field, or a field in a city (/in/berlin/design),
	 * from the same file the Worker made this page's HTML from.
	 * @type {{city?: string, field?: string}}
	 */
	let { city, field } = $props();
	/** The page's file; undefined while it loads, null when there is none. */
	let page = $state.raw(/** @type {Awaited<ReturnType<typeof getLandingPage>> | undefined} */ (undefined));
	// svelte-ignore state_referenced_locally
	getLandingPage({ city, field }).then((found) => (page = found));
	const fieldName = $derived(field ? t(`field.${field}`) : '');
	const cityName = $derived(page?.name || city || '');

	/** @param {string} cityName */
	function title(cityName) {
		if (city && field) return t('landing.cityField', { city: cityName, field: fieldName });
		if (city) return t('landing.city', { city: cityName });
		return t('landing.field', { field: fieldName });
	}
</script>

<svelte:head><title>{title(cityName)} · {config.name}</title></svelte:head>

{#if page === undefined}
	<Pending />
{:else if page}
		<jl-landing-page>
			<nav><a href="/in">{t('landing.cities')}</a> · <a href="/field">{t('landing.fields')}</a></nav>
			<PageHeader title={title(cityName)} intro={t('landing.intro', { count: page.count })}>
				{#snippet actions()}<FollowFeed feed={{ city, field }} />{/snippet}
			</PageHeader>
			<p><a href={explorerPath({ cityName: city ? cityName : '', field })}><Icon name="map" /> {t('landing.explore')}</a></p>
			<ul>
				{#each page.jobs as job (job.url)}
					<li><JobItem {job} company={page.names[job.company] || job.company} /></li>
				{/each}
			</ul>
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
		</jl-landing-page>
{:else}
	<p>{t('landing.notFound')}</p>
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
