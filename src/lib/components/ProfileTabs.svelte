<script>
	import Icon from './Icon.svelte';
	import tabs from '#lib/data/profile-tabs.json';
	import { page } from '$app/state';
	import { companiesBy, listsBy, postsBy } from '#lib/network/profile.svelte.js';
	import { formatNumber, t } from '#lib/i18n/index.svelte.js';

	/**
	 * An account's tabs (src/lib/data/profile-tabs.json), each with how many things it holds.
	 * whenAny: shown only when there is something, or on one's own page (to post the first).
	 * Phones: the whole width, kept in sight under the header.
	 * @type {{handle: string, did: string, self: boolean}}
	 */
	let { handle, did, self } = $props();
	/** @type {Record<string, number>} */
	const counts = $derived({ lists: listsBy(did).length, posts: postsBy(did, self).length, companies: companiesBy(did).length });
	const shown = $derived(
		tabs
			.filter((tab) => !tab.whenAny || self || counts[tab.count])
			.map((tab) => ({ ...tab, icon: /** @type {import('#lib/icons.js').IconName} */ (tab.icon) }))
	);
</script>

<jl-profile-tabs>
	<nav aria-label={t('profile.tabs')}>
		{#each shown as tab (tab.path)}
			{@const href = `/${handle}${tab.path}`}
			<a {href} aria-current={page.url.pathname === href ? 'page' : undefined}>
				<Icon name={tab.icon} />
				<span>{t(tab.label)}</span>
				<small>{formatNumber(counts[tab.count])}</small>
			</a>
		{/each}
	</nav>
</jl-profile-tabs>

<style>
	/* Phones: edge to edge, under the sticky header; wide screens: tabs under the profile. */
	jl-profile-tabs {
		display: block;
		position: sticky;
		top: var(--header-height);
		z-index: 2;
		margin: 0 calc(-1 * var(--gutter)) var(--space-s);
		background: var(--color-bg);
		border-bottom: var(--border);
	}
	/* Each tab as wide as its words, the room left shared between them. */
	nav {
		display: flex;
		padding: 0 var(--gutter);
		overflow-x: auto;
		scrollbar-width: none;
	}
	nav > a {
		flex: 1 0 auto;
	}
	a {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-xs);
		min-width: 0;
		min-height: var(--tap-size);
		padding: 0 var(--space-xs);
		color: var(--color-muted);
		font-size: var(--font-size-small);
		text-decoration: none;
		border-bottom: var(--selected-bar) solid transparent;
	}
	span {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	a[aria-current='page'] {
		color: var(--color-fg);
		font-weight: var(--font-weight-strong);
		border-bottom-color: var(--color-fg);
	}
	/* Phones: the words alone, so they fit. */
	@media not (min-width: 64rem) {
		a > :global(jl-icon) {
			display: none;
		}
	}
	@media (min-width: 64rem) {
		nav {
			gap: var(--space-m);
		}
		nav > a {
			flex: none;
		}
		a {
			justify-content: flex-start;
			font-size: var(--font-size);
		}
	}
</style>
