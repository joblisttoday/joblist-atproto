<script>
	/**
	 * A page to make or change something (a list, an organization, a job): one column at a
	 * readable width, in the middle of the screen. A form reads top to bottom; what it will look
	 * like comes after its fields, before saving.
	 * @type {{children: import('svelte').Snippet}}
	 */
	let { children } = $props();
</script>

<jl-form-page>{@render children()}</jl-form-page>

<style>
	jl-form-page {
		display: block;
		max-width: var(--reading-width);
		margin-inline: auto;
	}
</style>
