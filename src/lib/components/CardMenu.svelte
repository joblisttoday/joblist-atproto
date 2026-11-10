<script>
	import Icon from './Icon.svelte';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * A card's "…": what can be done with this job or organization without opening it.
	 * A native popover (it closes on Escape or a tap outside), placed under its button;
	 * its items are made only while it is open: a list has hundreds of cards.
	 * items: `<li>` with a button or a link each; done() closes the menu.
	 * @type {{label: string, items: import('svelte').Snippet<[() => void]>}}
	 */
	let { label, items } = $props();
	const id = $props.id();
	/** @type {HTMLButtonElement | undefined} */
	let button = $state();
	/** @type {HTMLElement | undefined} */
	let menu = $state();
	let open = $state(false);
	/** Under its button, or above it in the lower half of the screen. */
	let place = $state({ top: '', bottom: '', right: '' });

	/** @param {ToggleEvent} event */
	function toggled(event) {
		open = event.newState === 'open';
		if (!open || !button) return;
		const box = button.getBoundingClientRect();
		const right = `${Math.max(0, document.documentElement.clientWidth - box.right)}px`;
		const low = box.bottom > window.innerHeight / 2;
		place = low ? { top: '', bottom: `${window.innerHeight - box.top}px`, right } : { top: `${box.bottom}px`, bottom: '', right };
	}
	const done = () => menu?.hidePopover();
</script>

<jl-card-menu>
	<button type="button" bind:this={button} popovertarget="{id}-menu" title={label} aria-label={label}><Icon name="more" /></button>
	<menu id="{id}-menu" popover bind:this={menu} ontoggle={toggled} style:top={place.top} style:bottom={place.bottom} style:right={place.right}>
		{#if open}{@render items(done)}{/if}
	</menu>
</jl-card-menu>

<style>
	jl-card-menu {
		display: contents;
	}
	button {
		min-width: var(--tap-size);
		min-height: var(--tap-size);
		padding: 0;
		border: 0;
		background: none;
		color: var(--color-muted);
	}
	button:hover:not(:disabled) {
		color: var(--color-fg);
	}
	menu:not(:popover-open) {
		display: none;
	}
	menu {
		position: fixed;
		inset: auto;
		display: block;
		margin: 0;
		padding: var(--space-xs) 0;
		min-width: var(--menu-width);
		max-width: calc(100vw - 2 * var(--gutter));
		list-style: none;
		background: var(--color-bg);
		color: var(--color-fg);
		border: var(--border);
		border-radius: var(--radius);
		box-shadow: var(--shadow);
	}
	menu :global(li > :is(a, button)) {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		gap: var(--space-s);
		width: 100%;
		min-height: var(--tap-size);
		padding: 0 var(--space-m);
		border: 0;
		border-radius: 0;
		background: none;
		color: var(--color-fg);
		font: inherit;
		text-align: start;
		text-decoration: none;
		white-space: nowrap;
	}
	menu :global(li > :is(a, button):hover) {
		background: var(--color-soft);
	}
</style>
