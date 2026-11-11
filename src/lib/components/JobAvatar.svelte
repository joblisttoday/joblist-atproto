<script>
	/**
	 * An organization's picture beside its jobs: its Bluesky picture, else its initial in its
	 * own color (from its key), the same on joblist and in the embed.
	 * @type {{key: string, name: string, src?: string}}
	 */
	let { key, name, src = '' } = $props();
	const hue = $derived([...key].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7));
</script>

<jl-avatar style="--hue: {hue}" aria-hidden="true">{#if src}<img {src} alt="" loading="lazy" />{:else}{name.trim().charAt(0).toUpperCase()}{/if}</jl-avatar>

<style>
	jl-avatar {
		display: grid;
		place-items: center;
		width: var(--avatar-small);
		height: var(--avatar-small);
		border-radius: var(--radius);
		background: hsl(var(--hue) var(--avatar-saturation) var(--avatar-lightness));
		color: var(--color-avatar-fg);
		font-weight: var(--font-weight-strong);
		overflow: hidden;
	}
	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
</style>
