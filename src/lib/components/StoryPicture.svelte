<script>
	/**
	 * The picture of one of joblist's four ideas (step 0–3): its domain is its handle; its
	 * account keeps its description and jobs; its page on joblist; its jobs on its own website;
	 * or all in one (step 4, 'summary'): its account, shown on joblist and on its website.
	 * It plays once when shown; not at all with reduced motion. It only illustrates the text
	 * beside it.
	 * @type {{step: number}}
	 */
	let { step } = $props();
	const rows = [140, 110, 160];
</script>

<svg viewBox="0 0 320 200" aria-hidden="true">
	{#key step}
		{#if step === 4}
			<g>
				<rect x="12" y="52" width="112" height="96" rx="10" class="panel" />
				<circle cx="32" cy="72" r="8" class="fg" />
				<text x="46" y="76" class="start small">@example.org</text>
				{#each [0, 1, 2] as i (i)}
					<g class="rise" style="--d: {0.1 + i * 0.2}s">
						<rect x="24" y={90 + i * 17} width="88" height="12" rx="3" class="card" />
						<rect x="30" y={94 + i * 17} width={[50, 40, 60][i]} height="4" rx="2" class="muted" />
					</g>
				{/each}
				<path d="M128 88c18 0 22-34 44-38m-6-5 6 5-6 5" class="stroke draw" style="--d: 0.7s" />
				<path d="M128 112c18 0 22 34 44 38m-7-3 7-3-4 6" class="stroke draw" style="--d: 0.9s" />
				<g class="rise" style="--d: 1.1s">
					<rect x="176" y="14" width="132" height="76" rx="8" class="card" />
					<path d="M176 22a8 8 0 0 1 8-8h116a8 8 0 0 1 8 8v8H176Z" class="soft" />
					<text x="184" y="25.5" class="start tiny">joblist.today/<tspan class="strong">example.org</tspan></text>
					<rect x="186" y="40" width="14" height="14" rx="3" class="fg" />
					<rect x="206" y="43" width="60" height="5" rx="2.5" class="fg" />
					<rect x="186" y="62" width="100" height="4" rx="2" class="fg" />
					<rect x="186" y="74" width="80" height="4" rx="2" class="fg" />
				</g>
				<g class="rise" style="--d: 1.3s">
					<rect x="176" y="110" width="132" height="76" rx="8" class="card" />
					<path d="M176 118a8 8 0 0 1 8-8h116a8 8 0 0 1 8 8v8H176Z" class="soft" />
					<text x="184" y="121.5" class="start tiny"><tspan class="strong">example.org</tspan>/jobs</text>
					<rect x="176" y="126" width="132" height="12" class="accent" />
					<rect x="186" y="146" width="112" height="32" rx="4" class="embed" />
					<rect x="192" y="153" width="80" height="4" rx="2" class="fg" />
					<rect x="192" y="165" width="64" height="4" rx="2" class="fg" />
				</g>
			</g>
		{:else if step === 0}
			<g>
				<rect x="16" y="58" width="124" height="84" rx="10" class="panel" />
				<circle cx="78" cy="88" r="14" class="stroke" />
				<ellipse cx="78" cy="88" rx="6" ry="14" class="stroke" />
				<path d="M64 88h28" class="stroke" />
				<text x="78" y="126">example.org</text>
				<rect x="180" y="58" width="124" height="84" rx="10" class="panel" />
				<circle cx="242" cy="88" r="14" class="fg" />
				<text x="242" y="126">@example.org</text>
				<path d="M144 92h30m-6-5 6 5-6 5" class="stroke draw" />
				<path d="M176 108h-30m6-5-6 5 6 5" class="stroke draw" style="--d: 0.5s" />
				<g class="pop" style="--d: 1s">
					<circle cx="300" cy="62" r="11" class="accent" />
					<path d="m294.5 62 4 4 7-8" class="check" />
				</g>
			</g>
		{:else if step === 1}
			<g>
				<rect x="56" y="14" width="208" height="172" rx="12" class="panel" />
				<circle cx="80" cy="38" r="10" class="fg" />
				<text x="98" y="42" class="start">@example.org</text>
				<g class="rise" style="--d: 0.15s">
					<rect x="72" y="60" width="176" height="36" rx="6" class="card" />
					<rect x="82" y="70" width="84" height="7" rx="3.5" class="fg" />
					<rect x="82" y="83" width="124" height="5" rx="2.5" class="muted" />
				</g>
				{#each rows as w, i (i)}
					<g class="rise" style="--d: {0.5 + i * 0.3}s">
						<rect x="72" y={104 + i * 26} width="176" height="20" rx="5" class="card" />
						<rect x="82" y={111 + i * 26} width={w * 0.7} height="6" rx="3" class="muted" />
					</g>
				{/each}
			</g>
		{:else}
			<g>
				<rect x="16" y="14" width="288" height="172" rx="10" class="card" />
				<path d="M16 24a10 10 0 0 1 10-10h268a10 10 0 0 1 10 10v16H16Z" class="soft" />
				<circle cx="31" cy="27" r="3" class="muted" />
				<circle cx="42" cy="27" r="3" class="muted" />
				<circle cx="53" cy="27" r="3" class="muted" />
				<rect x="68" y="20" width="224" height="14" rx="7" class="card" />
				{#if step === 2}
					<text x="78" y="30.5" class="start url">joblist.today/<tspan class="strong">example.org</tspan></text>
					<g class="rise" style="--d: 0.15s">
						<rect x="36" y="54" width="26" height="26" rx="5" class="fg" />
						<rect x="72" y="58" width="112" height="8" rx="4" class="fg" />
						<rect x="72" y="71" width="72" height="5" rx="2.5" class="muted" />
					</g>
					{#each rows as w, i (i)}
						<g class="rise" style="--d: {0.45 + i * 0.25}s">
							<rect x="36" y={98 + i * 26} width={w} height="7" rx="3.5" class="fg" />
							<path d="M36 {114 + i * 26}h248" class="line" />
						</g>
					{/each}
				{:else}
					<text x="78" y="30.5" class="start url"><tspan class="strong">example.org</tspan>/jobs</text>
					<rect x="16" y="40" width="288" height="24" class="accent" />
					<rect x="32" y="49" width="44" height="6" rx="3" class="accent-fg" />
					<rect x="232" y="49" width="56" height="6" rx="3" class="accent-fg" />
					<rect x="36" y="76" width="248" height="98" rx="8" class="embed" />
					<text x="46" y="91" class="start code">&lt;joblist-jobs&gt;</text>
					{#each rows as w, i (i)}
						<g class="rise" style="--d: {0.3 + i * 0.25}s">
							<rect x="46" y={102 + i * 22} width={w * 0.9} height="7" rx="3.5" class="fg" />
							<path d="M46 {116 + i * 22}h228" class="line" />
						</g>
					{/each}
					<path d="M271 94a8 8 0 1 1-2.3-5.7M269 84v5h-5" class="stroke spin" />
				{/if}
			</g>
		{/if}
	{/key}
</svg>

<style>
	svg {
		display: block;
		width: 100%;
		margin-inline: auto;
		height: auto;
		border-radius: var(--radius-large);
		background: var(--color-soft);
		font-family: var(--font-family);
		font-size: 12px;
	}
	/* The picture, in the page's colors (light and dark). */
	text {
		fill: var(--color-fg);
		text-anchor: middle;
	}
	.start {
		text-anchor: start;
	}
	.url {
		font-size: 9px;
		fill: var(--color-muted);
	}
	.small {
		font-size: 10px;
	}
	.tiny {
		font-size: 7px;
		fill: var(--color-muted);
	}
	.code {
		font-family: ui-monospace, monospace;
		font-size: 9px;
		fill: var(--color-muted);
	}
	.strong {
		fill: var(--color-fg);
		font-weight: var(--font-weight-strong);
	}
	.panel {
		fill: var(--color-bg);
		stroke: var(--color-line);
	}
	.card {
		fill: var(--color-bg);
		stroke: var(--color-line);
	}
	.soft {
		fill: var(--color-soft);
	}
	.fg {
		fill: var(--color-fg);
	}
	.muted {
		fill: var(--color-line);
	}
	.accent {
		fill: var(--color-accent);
	}
	.accent-fg {
		fill: var(--color-accent-fg);
	}
	.line {
		stroke: var(--color-line);
	}
	.embed {
		fill: none;
		stroke: var(--color-muted);
		stroke-dasharray: 4 3;
	}
	.stroke {
		fill: none;
		stroke: var(--color-muted);
		stroke-width: 1.5;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.check {
		fill: none;
		stroke: var(--color-accent-fg);
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	/* Each picture plays once. */
	.rise,
	.pop,
	.draw,
	.spin {
		transform-box: fill-box;
		transform-origin: center;
		animation: 500ms cubic-bezier(0.3, 1.3, 0.5, 1) var(--d, 0s) both;
	}
	.rise {
		animation-name: rise;
	}
	.pop {
		animation-name: pop;
	}
	.draw {
		stroke-dasharray: 60;
		animation-name: draw;
		animation-duration: 700ms;
		animation-timing-function: ease-out;
	}
	.spin {
		animation-name: spin;
		animation-duration: 900ms;
		animation-delay: 1s;
		animation-timing-function: ease-in-out;
	}
	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
	}
	@keyframes pop {
		from {
			opacity: 0;
			transform: scale(0.4);
		}
	}
	@keyframes draw {
		from {
			stroke-dashoffset: 60;
		}
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.rise,
		.pop,
		.draw,
		.spin {
			animation: none;
		}
	}
</style>
