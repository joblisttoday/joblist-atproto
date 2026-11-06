<script>
	import { icons } from '#lib/icons.js';

	/**
	 * An icon, by what it means (see icons.js). Decorative: the text beside it says
	 * the same, so screen readers skip it; give `label` when it stands alone.
	 * @type {{name: import('#lib/icons.js').IconName, label?: string}}
	 */
	let { name, label } = $props();
	const Glyph = $derived(icons[name]);
</script>

<jl-icon role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : 'true'}>
	<Glyph size="1em" strokeWidth={2} />
</jl-icon>

<style>
	jl-icon {
		display: inline-flex;
		flex: none;
		vertical-align: -0.125em;
		font-size: var(--icon-size);
	}
	jl-icon :global(svg) {
		display: block;
	}
</style>
