<script>
	import Icon from './Icon.svelte';

	/**
	 * A group of Settings' rows: each a place (a link, on to its page ›, or out ↗) or an
	 * action (a button), with its icon, what it is and, small, its current value.
	 * @type {{items: {label: string, icon: import('#lib/icons.js').IconName, href?: string, onclick?: () => void, value?: string, external?: boolean}[]}}
	 */
	let { items } = $props();
</script>

<menu>
	{#each items as item (item.label)}
		<li>
			{#if item.href}
				<a href={item.href} target={item.external ? '_blank' : undefined} rel={item.external ? 'noopener' : undefined}>
					<Icon name={item.icon} />
					<span>{item.label}</span>
					{#if item.value}<small>{item.value}</small>{/if}
					<Icon name={item.external ? 'external' : 'next'} />
				</a>
			{:else}
				<button type="button" onclick={item.onclick}>
					<Icon name={item.icon} />
					<span>{item.label}</span>
				</button>
			{/if}
		</li>
	{/each}
</menu>

<style>
	menu {
		display: block;
		margin: 0 0 var(--space-m);
		padding: 0;
		list-style: none;
		border: var(--border);
		border-radius: var(--radius-large);
		overflow: hidden;
	}
	li + li {
		border-top: var(--border);
	}
	a,
	button {
		display: flex;
		align-items: center;
		gap: var(--space-s);
		width: 100%;
		min-height: var(--tap-size);
		padding: var(--space-xs) var(--space-m);
		border: 0;
		border-radius: 0;
		background: none;
		color: var(--color-fg);
		font: inherit;
		text-align: start;
		text-decoration: none;
	}
	a:hover,
	button:hover {
		background: var(--color-soft);
	}
	span {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	small,
	a > :global(svg:last-child) {
		flex: none;
		color: var(--color-muted);
	}
</style>
