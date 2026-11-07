<script>
	import Icon from './Icon.svelte';
	import actions from '#lib/data/page-actions.json';
	import { page } from '$app/state';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * What can be done on this page, in one menu on every screen: share it (the
	 * installed app has no address bar), and make what fits here (src/lib/data/page-actions.json,
	 * by route; "*" elsewhere). A native popover: it closes by itself on Escape or a tap outside.
	 */
	const id = $props.id();
	/** @type {HTMLElement | undefined} */
	let menu = $state();
	let copied = $state(false);

	const items = $derived(
		(/** @type {Record<string, {href: string, label: string, icon: string}[]>} */ (actions)[page.route.id || ''] ?? actions['*']).map((a) => ({
			...a,
			href: a.href.replace(/\{(\w+)\}/g, (_, name) => encodeURIComponent((/** @type {Record<string, string | undefined>} */ (page.params))[name] || '')),
			icon: /** @type {import('#lib/icons.js').IconName} */ (a.icon)
		}))
	);

	async function share() {
		const url = location.href;
		try {
			if (navigator.share) await navigator.share({ title: document.title, url });
			else {
				await navigator.clipboard.writeText(url);
				copied = true;
				setTimeout(() => (copied = false), 2000);
				return;
			}
		} catch {
			// cancelled, or not allowed: nothing to say
		}
		menu?.hidePopover();
	}
</script>

<jl-page-menu>
	<button type="button" popovertarget="{id}-menu" title={t('menu.label')}><Icon name="more" label={t('menu.label')} /></button>
	<menu id="{id}-menu" popover bind:this={menu}>
		<li><button type="button" onclick={share}><Icon name="share" /> {copied ? t('menu.copied') : t('menu.share')}</button></li>
		{#each items as item (item.href)}
			<li><a href={item.href} onclick={() => menu?.hidePopover()}><Icon name={item.icon} /> {t(item.label)}</a></li>
		{/each}
	</menu>
</jl-page-menu>

<style>
	jl-page-menu {
		display: contents;
	}
	jl-page-menu > button {
		min-width: var(--tap-size);
		min-height: var(--tap-size);
		border: 0;
		background: none;
	}
	/* Closed, hidden: the site's own menu style would show it. */
	menu:not(:popover-open) {
		display: none;
	}
	menu {
		display: block;
		inset: var(--header-height) var(--gutter) auto auto;
		margin: 0;
		padding: var(--space-xs) 0;
		min-width: var(--menu-width);
		list-style: none;
		background: var(--color-bg);
		color: var(--color-fg);
		border: var(--border);
		border-radius: var(--radius);
		box-shadow: var(--shadow);
	}
	menu a,
	menu button {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap: var(--space-s);
		width: 100%;
		min-height: var(--tap-size);
		padding: 0 var(--space-m);
		border: 0;
		border-radius: 0;
		background: none;
		color: var(--color-fg);
		font: inherit;
		text-align: start;
		text-decoration: none;
	}
	menu a:hover,
	menu button:hover,
	menu a:focus-visible,
	menu button:focus-visible {
		background: var(--color-soft);
	}
</style>
