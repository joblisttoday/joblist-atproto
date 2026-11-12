<script>
	import config from '#lib/data/config.json';
	import Icon from '#lib/components/Icon.svelte';
	import JobAvatar from '#lib/components/JobAvatar.svelte';
	import Logo from '#lib/components/Logo.svelte';
	import MenuLinks from '#lib/components/MenuLinks.svelte';
	import { accounts } from '#lib/auth/accounts.js';
	import { session } from '#lib/auth/session.svelte.js';
	import { data } from '#lib/network/network.svelte.js';
	import { device, devicePath } from '#lib/local/device.svelte.js';
	import { i18n, t } from '#lib/i18n/index.svelte.js';

	/**
	 * The menu, as enform's settings: who you are, once and large, opening your profile (this
	 * device's, /{name}.local, or the account's, /{domain}: the same view as anyone's); a row
	 * to switch account, with the others; signed out, Sign in (organizations); this browser's
	 * settings, the source; at its end, joblist's mark, the way home.
	 */
	const company = $derived(session.handle ? data.companies.get(session.handle) : undefined);
	const others = $derived(accounts().list.filter((a) => a.did !== session.did));

	/** @type {import('#lib/navigation/nav.js').MenuLink[]} */
	const switching = $derived(
		session.did || others.length
			? [
					{
						href: '/menu/accounts',
						icon: /** @type {const} */ ('me'),
						label: t('accounts.title'),
						chips: [...(session.did ? [{ text: t('accounts.device') }] : []), ...others.map((a) => ({ text: `@${a.handle || a.did}` }))]
					}
				]
			: []
	);
	/** @type {import('#lib/navigation/nav.js').MenuLink[]} */
	const signin = $derived(session.handle ? [] : [{ href: '/signin', icon: /** @type {const} */ ('companies'), label: t('nav.signin'), value: t('menu.forOrganizations') }]);
	/** @type {import('#lib/navigation/nav.js').MenuLink[]} */
	const browser = $derived([
		{ href: '/menu/language', icon: /** @type {const} */ ('language'), label: t('about.language'), value: t(`locale.${i18n.locale}`) },
		{ href: '/menu/collections', icon: /** @type {const} */ ('saved'), label: t('collections.transfer') },
		{ href: '/menu/apps', icon: /** @type {const} */ ('embed'), label: t('menu.apps') }
	]);
	/** @type {import('#lib/navigation/nav.js').MenuLink[]} */
	const source = [{ href: config.source, icon: /** @type {const} */ ('about'), label: t('menu.source'), external: true }];
</script>

<svelte:head><title>{t('nav.menu')} · {config.name}</title></svelte:head>

<jl-menu-page>
	<jl-visually-hidden><h1>{t('nav.menu')}</h1></jl-visually-hidden>
	<jl-you>
		{#if session.handle}
			<a href="/{session.handle}">
				<JobAvatar key={session.handle} name={company?.name || session.handle} src={session.avatar || ''} />
				<strong>{company?.name || `@${session.handle}`}</strong>
				{#if company?.name}<small>@{session.handle}</small>{/if}
			</a>
		{:else}
			<a href={devicePath()}>
				<jl-you-icon><Icon name="me" /></jl-you-icon>
				<strong>{device.name}.local</strong>
				<small>{t('accounts.device.help')}</small>
			</a>
		{/if}
	</jl-you>
	{#if switching.length}<MenuLinks label={t('accounts.title')} items={switching} hidden card />{/if}
	{#if signin.length}<MenuLinks label={t('nav.signin')} items={signin} hidden card />{/if}
	<MenuLinks label={t('about.language')} items={browser} hidden card />
	<MenuLinks label={t('menu.source')} items={source} hidden card />
	<footer><a href="/"><Logo /><b>{config.name}</b></a></footer>
</jl-menu-page>

<style>
	/* One column to scan, as wide as a phone even on a desktop. */
	jl-menu-page {
		display: block;
		max-width: var(--reading-width);
		margin-inline: auto;
		padding-bottom: var(--space-xl);
	}
	/* Who you are, once and large, centered (as Bluesky's and enform's). */
	jl-you > a {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-xxs);
		margin-top: var(--space-l);
		padding: var(--space-s);
		border-radius: var(--radius-large);
		color: inherit;
		text-align: center;
		text-decoration: none;
	}
	jl-you > a:hover {
		background: var(--color-soft);
	}
	jl-you :global(jl-avatar),
	jl-you-icon {
		display: grid;
		place-items: center;
		width: var(--avatar-size);
		height: var(--avatar-size);
		margin-bottom: var(--space-xs);
		border-radius: var(--radius-round);
		font-size: var(--font-size-large);
		--icon-size: 1.75rem;
	}
	jl-you-icon {
		background: var(--color-soft);
	}
	jl-you strong {
		max-width: 100%;
		font-size: var(--font-size-large);
		overflow-wrap: anywhere;
	}
	jl-you small {
		color: var(--color-muted);
		overflow-wrap: anywhere;
	}
	footer {
		display: flex;
		justify-content: center;
		margin-top: var(--space-xl);
	}
	footer a {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		min-height: var(--tap-size);
		text-decoration: none;
	}
</style>
