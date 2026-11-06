<!--
	joblist's mark: a J on a booklet whose cover opens when its link is pointed at
	or pressed. Drawn in the text color, so it follows the theme; the link names it.
-->
<jl-logo aria-hidden="true">
	<svg viewBox="0 0 64 64" fill="none" stroke="currentColor">
		<path d="M12.8 8.8 46.5 4.8V55L12.8 58.6Z" />
		<rect x="12.8" y="8.8" width="37.6" height="50.2" />
		<path d="M36.2 18v23.5a7 7 0 0 1-14 0" />
	</svg>
</jl-logo>

<style>
	jl-logo {
		display: inline-flex;
		flex: none;
	}
	svg {
		width: var(--logo-size);
		height: var(--logo-size);
		overflow: visible;
		stroke-width: var(--logo-stroke);
	}
	path {
		transition: transform var(--logo-open);
	}
	/* The cover, hinged on its left edge: its line keeps its width as it turns. */
	path:first-child {
		transform-origin: 12.8px 32px;
		vector-effect: non-scaling-stroke;
		stroke-width: calc(var(--logo-size) * var(--logo-stroke) / 64);
	}
	path:last-child {
		stroke-width: calc(var(--logo-stroke) * 3);
	}
	:global(a:hover) > jl-logo path:first-child,
	:global(a:focus-visible) > jl-logo path:first-child,
	:global(a:active) > jl-logo path:first-child {
		transform: scaleX(-0.35);
	}
	:global(a:hover) > jl-logo path:last-child,
	:global(a:focus-visible) > jl-logo path:last-child,
	:global(a:active) > jl-logo path:last-child {
		transform: translateY(-3px);
	}
</style>
