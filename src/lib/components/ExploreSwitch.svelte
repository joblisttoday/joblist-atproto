<script>
	import Icon from './Icon.svelte';
	import { page } from '$app/state';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Explore: every job or organization, each its own page, one tap apart.
	 * Wide screens have it in the header (in place of the search: the page has its own);
	 * phones, on top of the page's bar (bar).
	 * @type {{bar?: boolean}}
	 */
	let { bar = false } = $props();
	const places = [
		{ href: '/jobs', icon: /** @type {const} */ ('jobs'), label: 'nav.jobs' },
		{ href: '/companies', icon: /** @type {const} */ ('companies'), label: 'nav.companies' }
	];
</script>

<jl-explore-switch bar={bar || undefined}>
	<nav aria-label={t('nav.explore')}>
		{#each places as place (place.href)}
			<a href={place.href} aria-current={page.url.pathname === place.href ? 'page' : undefined}><Icon name={place.icon} /> {t(place.label)}</a>
		{/each}
	</nav>
</jl-explore-switch>

<style>
	jl-explore-switch {
		display: block;
		min-width: 0;
	}
	nav {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--space-xxs);
	}
	a {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-xs);
		min-height: var(--chip-height);
		padding: 0 var(--space-s);
		border-radius: var(--radius-round);
		color: var(--color-muted);
		font-size: var(--font-size-small);
		text-decoration: none;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	a:hover {
		color: var(--color-fg);
	}
	a[aria-current='page'] {
		background: var(--color-soft);
		color: var(--color-fg);
		font-weight: var(--font-weight-strong);
	}
	/* One place for it: the header on wide screens, the page's bar on phones. */
	@media (min-width: 64rem) {
		jl-explore-switch[bar] {
			display: none;
		}
		nav {
			display: flex;
		}
	}
	@media not (min-width: 64rem) {
		jl-explore-switch:not([bar]) {
			display: none;
		}
	}
</style>
