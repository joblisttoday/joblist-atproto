<script>
	import CardMenu from './CardMenu.svelte';
	import Icon from './Icon.svelte';
	import actions from '#lib/data/page-actions.json';
	import { page } from '$app/state';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * A page's "…", with the page (beside its title, or in its search bar): share it (the
	 * installed app has no address bar), and make what fits here (src/lib/data/page-actions.json,
	 * by route). Only pages someone would send to someone else have one: they place it
	 * themselves. own: what fits this thing, given by the page (an organization's: post a
	 * job there, edit it), after the route's.
	 * @type {{own?: {href: string, label: string, icon: import('#lib/icons.js').IconName}[]}}
	 */
	let { own = [] } = $props();
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

<CardMenu label={t('menu.label')}>
	{#snippet items(done)}
		<li><button type="button" onclick={() => share(done)}><Icon name="share" /> {copied ? t('menu.copied') : t('menu.share')}</button></li>
		{#each links as item (item.href)}
			<li><a href={item.href} onclick={done}><Icon name={item.icon} /> {t(item.label)}</a></li>
		{/each}
	{/snippet}
</CardMenu>
