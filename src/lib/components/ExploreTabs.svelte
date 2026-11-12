<script>
	import Icon from './Icon.svelte';
	import { page } from '$app/state';
	import { exploreOf, exploreTab } from '#lib/navigation/explore-tab.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Explore's switch, at the top of both its pages: Organizations (/companies) and Jobs
	 * (/jobs), one view with two parts. The one shown is the one Explore's tab opens next.
	 */
	const current = $derived(exploreOf(page.url.pathname));
	$effect(() => {
		if (current) exploreTab.href = current;
	});
</script>

<nav aria-label={t('nav.explore')}>
	<a href="/companies" aria-current={current === '/companies' ? 'page' : undefined}><Icon name="companies" /> {t('nav.companies')}</a>
	<a href="/jobs" aria-current={current === '/jobs' && page.url.pathname === '/jobs' ? 'page' : current === '/jobs' ? 'true' : undefined}><Icon name="jobs" /> {t('nav.jobs')}</a>
</nav>

<style>
	nav {
		display: grid;
		grid-template-columns: 1fr 1fr;
		padding: var(--space-xxs);
		border-radius: var(--radius-round);
		background: var(--color-soft);
	}
	a {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-xs);
		min-height: var(--tap-size);
		border-radius: var(--radius-round);
		color: var(--color-muted);
		text-decoration: none;
		font-weight: var(--font-weight-strong);
	}
	a[aria-current] {
		background: var(--color-bg);
		color: var(--color-fg);
		box-shadow: 0 1px 2px rgb(0 0 0 / 0.12);
	}
</style>
