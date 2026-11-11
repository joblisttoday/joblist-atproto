<script>
	import CardMenu from './CardMenu.svelte';
	import Icon from './Icon.svelte';
	import actions from '#lib/data/page-actions.json';
	import config from '#lib/data/config.json';
	import { feedPath } from '#lib/models/landing.js';
	import { page } from '$app/state';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * A page's "…", with the page (beside its title, or in its search bar): share it (the
	 * installed app has no address bar), and make what fits here (src/lib/data/page-actions.json,
	 * by route), and follow its jobs in a feed reader (feed: an Atom feed made by the Worker, also
	 * told to browsers and readers in the page's head). Only pages someone would send to someone
	 * else have one: they place it themselves. own: what fits this thing, given by the page
	 * (an organization's: post a job there, edit it), after the route's.
	 * @type {{feed?: Parameters<typeof feedPath>[0] | null, own?: {href: string, label: string, icon: import('#lib/icons.js').IconName}[]}}
	 */
	let { feed = null, own = [] } = $props();
	const feedHref = $derived(feed ? feedPath(feed) : '');
	const links = $derived(
		(/** @type {Record<string, {href: string, label: string, icon: string}[]>} */ (actions)[page.route.id || ''] ?? []).map((a) => ({
			...a,
			href: a.href.replace(/\{(\w+)\}/g, (_, name) => encodeURIComponent((/** @type {Record<string, string | undefined>} */ (page.params))[name] || '')),
			icon: /** @type {import('#lib/icons.js').IconName} */ (a.icon)
		})).concat(own)
	);
	let copied = $state(false);

	/** @param {() => void} done */
	async function share(done) {
		const url = location.href;
		try {
			if (navigator.share) await navigator.share({ title: document.title, url });
			else {
				await navigator.clipboard.writeText(url);
				copied = true;
				setTimeout(() => ((copied = false), done()), 1200);
				return;
			}
		} catch {
			// cancelled, or not allowed: nothing to say
		}
		done();
	}
</script>

<svelte:head>{#if feedHref}<link rel="alternate" type="application/atom+xml" title={t('landing.follow')} href={config.url + feedHref} />{/if}</svelte:head>

<CardMenu label={t('menu.label')}>
	{#snippet items(done)}
		<li><button type="button" onclick={() => share(done)}><Icon name="share" /> {copied ? t('menu.copied') : t('menu.share')}</button></li>
		{#if feedHref}<li><a href={feedHref} type="application/atom+xml" data-sveltekit-reload title={t('landing.follow.help')} onclick={done}><Icon name="feed" /> {t('landing.follow')}</a></li>{/if}
		{#each links as item (item.href)}
			<li><a href={item.href} onclick={done}><Icon name={item.icon} /> {t(item.label)}</a></li>
		{/each}
	{/snippet}
</CardMenu>
