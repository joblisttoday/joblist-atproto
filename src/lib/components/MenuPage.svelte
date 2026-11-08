<script>
	import config from '#lib/data/config.json';

	/**
	 * One of the menu's pages: its title, what it is for, and its one thing to do.
	 * @type {{title: string, intro?: string, children: import('svelte').Snippet}}
	 */
	let { title, intro = '', children } = $props();
</script>

<svelte:head><title>{title} · {config.name}</title></svelte:head>

<jl-menu-page>
	<h1>{title}</h1>
	{#if intro}<p><small>{intro}</small></p>{/if}
	{@render children()}
</jl-menu-page>

<style>
	jl-menu-page {
		display: block;
		max-width: var(--reading-width);
		margin-inline: auto;
		padding-bottom: var(--space-xl);
	}
</style>
