<script>
	import Icon from './Icon.svelte';
	import { page } from '$app/state';
	import { t } from '#lib/i18n/index.svelte.js';

	/** Explore: every job, organization or list, each its own page, one tap apart. */
	const places = [
		{ href: '/jobs', icon: /** @type {const} */ ('jobs'), label: 'nav.jobs' },
		{ href: '/companies', icon: /** @type {const} */ ('companies'), label: 'nav.companies' },
		{ href: '/lists', icon: /** @type {const} */ ('lists'), label: 'nav.lists' }
	];
</script>

<jl-explore-switch>
	<nav aria-label={t('nav.explore')}>
		{#each places as place (place.href)}
			<a href={place.href} aria-current={page.url.pathname === place.href ? 'page' : undefined}><Icon name={place.icon} /> {t(place.label)}</a>
		{/each}
	</nav>
</jl-explore-switch>

<style>
	jl-explore-switch {
		display: block;
	}
	nav {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		border: var(--border);
		border-radius: var(--radius);
		overflow: hidden;
	}
	a {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-xs);
		min-height: var(--tap-size);
		padding: 0 var(--space-xs);
		color: var(--color-muted);
		font-size: var(--font-size-small);
		text-decoration: none;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	a + a {
		border-inline-start: var(--border);
	}
	a[aria-current='page'] {
		background: var(--color-fg);
		color: var(--color-bg);
	}
	@media (min-width: 64rem) {
		nav {
			max-width: 32rem;
		}
	}
</style>
