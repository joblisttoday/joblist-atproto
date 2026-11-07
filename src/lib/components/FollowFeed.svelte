<script>
	import Icon from './Icon.svelte';
	import config from '#lib/data/config.json';
	import { feedPath } from '#lib/models/landing.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * A link to follow these jobs in a feed reader (an Atom feed made by the Worker),
	 * also told to browsers and readers in the page's head.
	 * @type {{feed: {city?: string, field?: string, company?: string, search?: string}}}
	 */
	let { feed } = $props();
	const href = $derived(feedPath(feed));
</script>

<svelte:head><link rel="alternate" type="application/atom+xml" title={t('landing.follow')} href={config.url + href} /></svelte:head>

<jl-follow-feed>
	<a {href} type="application/atom+xml" data-sveltekit-reload title={t('landing.follow.help')}><Icon name="feed" /> {t('landing.follow')}</a>
</jl-follow-feed>

<style>
	jl-follow-feed {
		display: block;
	}
	a {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
		min-height: var(--chip-height);
		font-size: var(--font-size-small);
	}
</style>
