<script>
	import Icon from './Icon.svelte';
	import CompanyMenu from './CompanyMenu.svelte';
	import { accountOf, thumbnail } from '#lib/network/accounts.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * jobs: how many it has open, when known. menu: its "…" (save, job board, website, link); not on a preview.
	 * @type {{company: import('#lib/models/company.js').Company, jobs?: number, menu?: boolean, children?: import('svelte').Snippet}}
	 */
	let { company, jobs, menu = true, children } = $props();
	const places = $derived(
		[...new Set(company.locations.map((l) => l.name).filter(Boolean))].slice(0, 3).join(', ')
	);
	const avatar = $derived(accountOf(company.key)?.avatar);
	const about = $derived([places, company.tags.slice(0, 3).join(' · ')].filter(Boolean).join(' — '));
</script>

<jl-company verified={company.verified || undefined} menu={menu || undefined}>
	{#if avatar}<img src={thumbnail(avatar)} alt="" loading="lazy" />{/if}
	<a href="/{company.key}">{company.name}</a>
	{#if company.verified}<span title={t('company.verified', { domain: company.key })}><Icon name="verified" label={t('company.verified', { domain: company.key })} /></span>{/if}
	{#if jobs}<data value={jobs}>{t('jobs.count', { count: jobs })}</data>{/if}
	{#if about}<small>{about}</small>{/if}
	{#if children}<jl-company-aside>{@render children()}</jl-company-aside>{/if}
	{#if menu}<jl-company-menu><CompanyMenu {company} /></jl-company-menu>{/if}
</jl-company>

<style>
	jl-company {
		display: block;
		position: relative;
		padding: var(--space-s) 0;
		border-bottom: var(--border);
	}
	img {
		width: var(--icon-avatar);
		height: var(--icon-avatar);
		margin-inline-end: var(--space-xs);
		border-radius: var(--radius);
		vertical-align: middle;
		object-fit: cover;
	}
	a {
		font-weight: var(--font-weight-strong);
		text-decoration: none;
	}
	/* The whole row opens the company. */
	a::after {
		content: '';
		position: absolute;
		inset: 0;
	}
	a:hover {
		text-decoration: underline;
	}
	span {
		color: var(--color-ok);
	}
	small {
		display: block;
	}
	/* Open jobs: at the end of the name's line. */
	data {
		float: inline-end;
		font-size: var(--font-size-small);
		color: var(--color-muted);
	}
	/* The "…" at the top of the row's end, over the row link. */
	jl-company[menu] {
		padding-inline-end: var(--tap-size);
	}
	jl-company-menu {
		position: absolute;
		top: var(--space-xxs);
		inset-inline-end: calc(-1 * var(--space-s));
		z-index: 1;
	}
	/* Above the row link, so its own links and buttons stay usable. */
	jl-company-aside {
		display: block;
		position: relative;
		z-index: 1;
	}
</style>
