<script>
	/**
	 * One choice among a few, all in view: radio buttons drawn as chips, a tap each.
	 * @type {{
	 *   name: string,
	 *   legend: string,
	 *   options: {value: string, label: string}[],
	 *   value: string,
	 *   required?: boolean,
	 *   help?: string,
	 *   tool?: string
	 * }}
	 *   help: said under the chips. tool: what an AI assistant is told it is (WebMCP).
	 */
	let { name, legend, options, value = $bindable(), required = false, help, tool } = $props();
	const id = $props.id();
</script>

<jl-choice-chips>
	<fieldset aria-describedby={help ? `${id}-help` : undefined}>
		<legend data-required={required || undefined}>{legend}</legend>
		<jl-chips>
			{#each options as option (option.value)}
				<label>
					<input type="radio" {name} value={option.value} bind:group={value} {required} toolparamdescription={tool} />
					<span>{option.label}</span>
				</label>
			{/each}
		</jl-chips>
		{#if help}<small id="{id}-help">{help}</small>{/if}
	</fieldset>
</jl-choice-chips>

<style>
	fieldset {
		margin: var(--space-m) 0 0;
		padding: 0;
		border: 0;
	}
	legend {
		margin-bottom: var(--space-xs);
		padding: 0;
		font-weight: var(--font-weight-strong);
	}
	jl-chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-xs);
	}
	label {
		display: inline-flex;
		margin: 0;
		font-weight: normal;
	}
	/* The radio stays for keyboards and screen readers; the chip shows it. */
	input {
		position: absolute;
		opacity: 0;
		width: 1px;
		height: 1px;
	}
	span {
		display: inline-flex;
		align-items: center;
		min-height: var(--chip-height);
		padding: 0 var(--space-m);
		border: var(--border);
		border-radius: var(--radius-round);
		cursor: pointer;
		font-size: var(--font-size-small);
	}
	label:hover span {
		background: var(--color-soft);
	}
	input:checked + span {
		background: var(--color-fg);
		color: var(--color-bg);
		border-color: var(--color-fg);
	}
	input:focus-visible + span {
		outline: var(--focus-ring);
		outline-offset: var(--focus-offset);
	}
	small {
		display: block;
		margin-top: var(--space-xs);
	}
</style>
