<script>
	import Icon from './Icon.svelte';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * A page's title, with the way back before it (to Settings, unless `back` says where).
	 * @type {{title: string, back?: string, backLabel?: string}}
	 */
	let { title, back = '/settings', backLabel = '' } = $props();
	const label = $derived(backLabel || t('nav.settings'));
</script>

<header>
	<a href={back} rel="up" aria-label={label} title={label}><Icon name="back" /></a>
	<h1>{title}</h1>
</header>

<style>
	header {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		margin: var(--space-l) 0 var(--space-m);
	}
	h1 {
		margin: 0;
	}
	a {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex: none;
		width: var(--tap-size);
		height: var(--tap-size);
		margin-inline-start: calc(var(--space-s) * -1);
		border-radius: var(--radius-round);
		color: var(--color-muted);
	}
	a:hover {
		background: var(--color-soft);
		color: var(--color-fg);
	}
</style>
