<script>
	import { accountOf, thumbnail } from '#lib/network/accounts.svelte.js';

	/**
	 * A company's picture where it is on Bluesky, otherwise its first letter: to tell companies apart at a glance.
	 * @type {{key: string, name?: string}}
	 */
	let { key, name = '' } = $props();
	const avatar = $derived(accountOf(key)?.avatar);
</script>

<jl-company-mark aria-hidden="true">
	{#if avatar}<img src={thumbnail(avatar)} alt="" loading="lazy" />{:else}{Array.from(name || key)[0]?.toUpperCase()}{/if}
</jl-company-mark>

<style>
	jl-company-mark {
		display: inline-grid;
		flex: none;
		place-items: center;
		width: var(--icon-avatar);
		height: var(--icon-avatar);
		overflow: hidden;
		border-radius: var(--radius);
		background: var(--color-soft);
		color: var(--color-muted);
		font-size: var(--font-size-small);
		font-weight: var(--font-weight-strong);
	}
	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
</style>
