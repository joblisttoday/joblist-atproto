<script>
	import config from '#lib/data/config.json';
	import Empty from '#lib/components/Empty.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import Collect from '#lib/components/Collect.svelte';
	import KeptOrganizations from '#lib/components/KeptOrganizations.svelte';
	import { kept } from '#lib/network/kept.svelte.js';
	import OwnListItem from '#lib/components/OwnListItem.svelte';
	import PageHeader from '#lib/components/PageHeader.svelte';
	import SavedSearches from '#lib/components/SavedSearches.svelte';
	import { recentLists } from '#lib/models/own-lists.js';
	import { session } from '#lib/auth/session.svelte.js';
	import { own } from '#lib/network/own-lists.svelte.js';
	import { savedJobs } from '#lib/network/saved-jobs.svelte.js';
	import { searches } from '#lib/network/saved-searches.svelte.js';
	import { formatNumber, t } from '#lib/i18n/index.svelte.js';

	/**
	 * What is yours, at a glance: a few of your searches and lists, each leading to
	 * its own page (/me/searches, /me/lists), under a link to your page (or to sign in).
	 * Kept in this browser, signed in or not: signing in is only for publishing.
	 */
	const max = config.me.glance;
	const lists = $derived(recentLists(own.lists, max));
	const listCount = $derived(own.lists.length);

</script>

<svelte:head><title>{t('nav.me')} · {config.name}</title></svelte:head>

<jl-me>
	<PageHeader title={t('nav.me')} intro={t('me.intro')} />
	<!-- Your public page, signed in; else where to sign in (only to publish). -->
	<p data-account>
		{#if session.handle}
			<a href="/{session.handle}"><Icon name="me" /> {t('settings.profile')} <small>@{session.handle}</small></a>
		{:else}
			<a href="/signin"><Icon name="signin" /> {t('nav.signin')}</a>
		{/if}
	</p>

	<section aria-labelledby="me-searches">
		<h2 id="me-searches"><a href="/me/searches">{t('saved.searches')}</a></h2>
		{#if searches.list.length}
			<SavedSearches jobs={savedJobs.jobs} names={savedJobs.names} {max} />
			{#if searches.list.length > max}<p><a href="/me/searches">{t('me.all', { count: formatNumber(searches.list.length) })} <Icon name="next" /></a></p>{/if}
		{:else}
			<Empty text={t('saved.empty')}><a href="/jobs"><Icon name="search" /> {t('saved.explore')}</a></Empty>
		{/if}
	</section>

	<section aria-labelledby="me-organizations">
		<h2 id="me-organizations"><a href="/me/organizations">{t('kept.short')}</a></h2>
		{#if kept.list.length}
			<KeptOrganizations {max} />
			{#if kept.list.length > max}<p><a href="/me/organizations">{t('me.all', { count: formatNumber(kept.list.length) })} <Icon name="next" /></a></p>{/if}
		{:else}
			<Empty text={t('kept.empty')} />
		{/if}
		<jl-me-keep><Collect /></jl-me-keep>
	</section>

	<section aria-labelledby="me-lists">
		<h2 id="me-lists"><a href="/me/lists">{t('nav.lists')}</a></h2>
		{#if lists.length}
			<ul>
				{#each lists as list (list.id)}<li><OwnListItem {list} /></li>{/each}
			</ul>
		{:else}
			<Empty text={t('me.lists.none')} />
		{/if}
		<p><a href="/me/lists">{t('me.all', { count: formatNumber(listCount) })} <Icon name="next" /></a></p>
	</section>

</jl-me>

<style>
	/* One column to scan, as wide as a phone even on a desktop. */
	jl-me {
		display: block;
		max-width: var(--reading-width);
		margin-inline: auto;
		padding-bottom: var(--space-xl);
	}
	section {
		margin-top: var(--space-l);
	}
	jl-me-keep {
		display: block;
		margin-top: var(--space-s);
	}
	h2 {
		margin-bottom: var(--space-xs);
		font-size: var(--font-size-small);
	}
	h2 a {
		color: var(--color-muted);
		text-decoration: none;
	}
	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	[data-account] {
		margin: 0;
	}
	[data-account] a {
		gap: var(--space-xs);
	}
	[data-account] small {
		color: var(--color-muted);
	}
	p a {
		display: inline-flex;
		align-items: center;
		min-height: var(--tap-size);
	}
</style>
