<script>
	import Icon from './Icon.svelte';
	import { isKept, toggleKept } from '#lib/network/kept.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * "Save", as for a job: one tap keeps the organization in this browser (kept.svelte.js),
	 * with the others kept on /me.
	 * @type {{company: {key: string, name: string}}}
	 */
	let { company } = $props();
	const saved = $derived(isKept(company.key));
</script>

<button type="button" aria-pressed={saved ? 'true' : 'false'} onclick={() => toggleKept(company)} title={t('collections.private')}>
	<Icon name={saved ? 'savedOn' : 'save'} /> {t(saved ? 'collections.saved' : 'collections.save')}
</button>

<style>
	button[aria-pressed='true'] {
		background: var(--color-soft);
		color: var(--color-ok);
	}
</style>
