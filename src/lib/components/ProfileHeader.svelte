<script>
	import config from '#lib/data/config.json';
	import { data } from '#lib/network/network.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/** @type {{did?: string, handle: string, children?: import('svelte').Snippet}} */
	let { did, handle, children } = $props();
	const profile = $derived(did ? data.profiles.get(did) : undefined);
</script>

<jl-profile-header>
	<header>
		{#if profile?.avatar}<img src={profile.avatar} alt="" width="64" height="64" loading="lazy" />{/if}
		<hgroup>
			<h1>{profile?.displayName || `@${handle}`}</h1>
			<p>
				<small>
					{#if profile?.displayName}@{handle} · {/if}
					<a href={config.links.profile.replace('{handle}', handle)} target="_blank" rel="noopener">{t('profile.bluesky')} ↗</a>
				</small>
			</p>
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
	header > :global(menu) {
		grid-column: 1 / -1;
	}
</style>
