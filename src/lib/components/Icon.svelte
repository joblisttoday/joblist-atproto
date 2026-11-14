<script>
	import { icons } from '#lib/icons.js';

	/**
	 * An icon (icons.js), drawn inline in the text color, at --icon-size. Decorative: the
	 * label beside it says the same.
	 * @type {{name: import('#lib/icons.js').IconName}}
	 */
	let { name } = $props();
</script>

<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
	{#each icons[name] as d (d)}<path {d} />{/each}
</svg>

<style>
	svg {
		display: block;
		flex: none;
		width: var(--icon-size);
		height: var(--icon-size);
	}
</style>
