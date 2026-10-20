<script>
	import { page } from '$app/state';

	/**
	 * Tabs as links: the open tab is in the URL (?tab=…), so it survives
	 * reloads, back navigation and sharing.
	 * @type {{tabs: {id: string, label: string}[], current: string, label: string}}
	 */
	let { tabs, current, label } = $props();

	/** @param {string} id */
	function href(id) {
		const params = new URLSearchParams(page.url.search);
		if (id === tabs[0].id) params.delete('tab');
		else params.set('tab', id);
		const query = params.toString();
		return query ? `?${query}` : page.url.pathname;
	}
</script>

<jl-tabs>
	<nav aria-label={label} data-sveltekit-replacestate data-sveltekit-noscroll data-sveltekit-keepfocus>
		{#each tabs as tab (tab.id)}
			<a href={href(tab.id)} aria-current={current === tab.id ? 'page' : undefined}>
				{tab.label}
			</a>
		{/each}
	</nav>
</jl-tabs>

<style>
	nav {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: 1fr;
		margin: var(--space-m) 0;
		border-bottom: var(--border);
	}
	a {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: var(--tap-size);
		text-decoration: none;
		color: var(--color-muted);
		border-bottom: var(--focus-offset) solid transparent;
		margin-bottom: calc(-1 * var(--border-width));
	}
	a:hover {
		color: var(--color-fg);
	}
	a[aria-current='page'] {
		color: var(--color-fg);
		font-weight: var(--font-weight-strong);
		border-bottom-color: var(--color-fg);
	}
</style>
