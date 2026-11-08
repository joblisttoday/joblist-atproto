<script>
	import Icon from './Icon.svelte';

	/**
	 * A group of the menu's rows: each a place (a link) or an action (a button), with its
	 * icon, what it is, and, small, its current value; a link goes on (›).
	 * @type {{label: string, items: import('#lib/navigation/nav.js').MenuLink[]}}
	 */
	let { label, items } = $props();
	const id = $props.id();
</script>

<section aria-labelledby={id}>
	<h2 {id}>{label}</h2>
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
					<button type="button" onclick={item.onclick}><Icon name={item.icon} /> <span>{item.label}</span></button>
				{/if}
			</li>
		{/each}
	</menu>
</section>

<style>
	section {
		margin-top: var(--space-l);
	}
	h2 {
		margin-bottom: var(--space-xs);
		color: var(--color-muted);
		font-size: var(--font-size-small);
	}
	menu {
		display: block;
		margin: 0;
		padding: 0;
		border: var(--border);
		border-radius: var(--radius);
	}
	li + li {
		border-top: var(--border);
	}
	menu > li > :is(a, button) {
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
		font-size: var(--font-size);
		text-align: start;
		text-decoration: none;
	}
	span {
		flex: 1;
	}
	small {
		color: var(--color-muted);
	}
</style>
