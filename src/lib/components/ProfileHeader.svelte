<script>
	import Icon from './Icon.svelte';
	import config from '#lib/data/config.json';
	import { data } from '#lib/network/network.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/** @type {{did?: string, handle: string, children?: import('svelte').Snippet}} */
	let { did, handle, children } = $props();
	const profile = $derived(did ? data.profiles.get(did) : undefined);
	// Its handle is a company's domain: the account is that company's.
	const company = $derived(data.companies.get(handle));
</script>

<jl-profile-header>
	<header>
		{#if profile?.avatar}<img src={profile.avatar} alt="" width="64" height="64" loading="lazy" />{/if}
		<hgroup>
			<h1>{profile?.displayName || `@${handle}`}</h1>
			<p>
				<small>
					{#if profile?.displayName}@{handle} · {/if}
					<a href={config.links.profile.replace('{handle}', handle)} target="_blank" rel="noopener">{t('profile.bluesky')} <Icon name="external" /></a>
				</small>
			</p>
			{#if company}
				<p><small><Icon name="companies" /> {t('profile.company')} <a href="/{company.key}">{company.name}</a>{#if company.verified} <Icon name="verified" label={t('company.verified', { domain: company.key })} />{/if}</small></p>
			{/if}
		</hgroup>
		{@render children?.()}
	</header>
</jl-profile-header>

<style>
	header {
		display: grid;
		grid-template-columns: auto 1fr;
		align-items: center;
		gap: 0 var(--space-m);
		margin: var(--space-m) 0;
	}
	img {
		width: var(--avatar-size);
		height: var(--avatar-size);
		border-radius: var(--radius-round);
		background: var(--color-soft);
	}
	hgroup {
		grid-column: auto / -1;
		min-width: 0;
	}
	h1 {
		margin: 0;
		overflow-wrap: anywhere;
	}
	p {
		margin: 0;
	}
	header > :global(menu),
	header > :global(jl-locale-switch) {
		grid-column: 1 / -1;
	}
</style>
