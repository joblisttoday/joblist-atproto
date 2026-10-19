<script>
	import { ago } from '#lib/i18n/dates.js';
	import { i18n } from '#lib/i18n/index.svelte.js';

	/** @type {{datetime: string}} */
	let { datetime } = $props();
	const ms = $derived(Date.parse(datetime) || 0);
</script>

{#if ms}<time {datetime} title={new Date(ms).toLocaleString(i18n.locale)}>{ago(ms, i18n.locale)}</time>{/if}
