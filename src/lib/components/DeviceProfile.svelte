<script>
	import config from '#lib/data/config.json';
	import CardMenu from './CardMenu.svelte';
	import CollectionName from './CollectionName.svelte';
	import Icon from './Icon.svelte';
	import MenuLinks from './MenuLinks.svelte';
	import { goto } from '$app/navigation';
	import { device, renameDevice } from '#lib/local/device.svelte.js';
	import { kept } from '#lib/network/kept.svelte.js';
	import { own } from '#lib/network/own-lists.svelte.js';
	import { formatNumber, t } from '#lib/i18n/index.svelte.js';

	/**
	 * This device's profile (/{name}.local), the same view as anyone's page: its name, its "…"
	 * (rename it, move it to another device), and where what it keeps is in Explore: the
	 * organizations it follows (/companies), its lists of jobs (/jobs/{id}). Private: all of it
	 * stays in this browser.
	 */
	/** @type {import('#lib/navigation/nav.js').MenuLink[]} */
	const rows = $derived([
		{ href: '/companies', icon: /** @type {const} */ ('companies'), label: t('kept.title'), value: formatNumber(kept.list.length) },
		...own.lists.map((list) => ({
			href: list.href,
			icon: /** @type {import('#lib/icons.js').IconName} */ (list.builtin ? (list.id === 'applied' ? 'applied' : list.id === 'hidden' ? 'hide' : 'saved') : 'lists'),
			label: list.builtin ? t(`marks.${list.id}`) : list.name,
			value: formatNumber(list.count)
		}))
	]);
	let renaming = $state(false);

	/** @param {string} name */
	function rename(name) {
		renaming = false;
		goto(`/${renameDevice(name)}.local`, { replace: true });
	}
</script>

<svelte:head><title>{device.name}.local · {config.name}</title></svelte:head>

<jl-device-profile>
	<header>
		<jl-device-title>
			<jl-device-icon><Icon name="me" /></jl-device-icon>
			<h1>{device.name}.local</h1>
			<CardMenu label={t('menu.label')}>
				{#snippet items(done)}
					<li><button type="button" onclick={() => ((renaming = true), done())}><Icon name="edit" /> {t('device.rename')}</button></li>
					<li><a href="/menu/collections" onclick={done}><Icon name="saved" /> {t('collections.transfer')}</a></li>
				{/snippet}
			</CardMenu>
		</jl-device-title>
		<p><small>{t('accounts.device.help')}</small></p>
		{#if renaming}<CollectionName value={device.name} submit={t('device.rename')} onsubmit={rename} oncancel={() => (renaming = false)} />{/if}
	</header>

	<MenuLinks label={t('nav.explore')} items={rows} hidden card />
</jl-device-profile>

<style>
	jl-device-profile {
		display: block;
		max-width: var(--reading-width);
		margin-inline: auto;
		padding-bottom: var(--space-xl);
	}
	jl-device-title {
		display: flex;
		align-items: center;
		gap: var(--space-s);
		margin-top: var(--space-m);
	}
	jl-device-icon {
		display: grid;
		place-items: center;
		flex: none;
		width: var(--avatar-small);
		height: var(--avatar-small);
		border-radius: var(--radius-round);
		background: var(--color-soft);
	}
	h1 {
		flex: 1;
		min-width: 0;
		margin: 0;
		overflow-wrap: anywhere;
	}
	header p {
		margin: var(--space-xs) 0 0;
		color: var(--color-muted);
	}
</style>
