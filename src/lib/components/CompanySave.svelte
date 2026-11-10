<script>
	import Icon from './Icon.svelte';
	import { isSaved, toggleSaved } from '#lib/network/local-lists.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * "Save", as for a job: one tap keeps the organization in a private list in this browser
	 * (local-lists.svelte.js SAVED), whose page shows its jobs.
	 * @type {{key: string}}
	 */
	let { key } = $props();
	const saved = $derived(isSaved(key));
</script>

<button type="button" aria-pressed={saved ? 'true' : 'false'} onclick={() => toggleSaved(key, t('company.saved.list'))} title={t('collections.private')}>
	<Icon name={saved ? 'savedOn' : 'save'} /> {t(saved ? 'collections.saved' : 'collections.save')}
</button>

<style>
	button[aria-pressed='true'] {
		background: var(--color-soft);
		color: var(--color-ok);
	}
</style>
