<script>
	import Icon from './Icon.svelte';
	import { isKept, toggleKept } from '#lib/network/kept.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Follow an organization: one tap keeps it in this browser (kept.svelte.js), and its open
	 * jobs come into Jobs. onfollow: told when it starts following (to say so).
	 * @type {{company: {key: string, name: string}, onfollow?: () => void}}
	 */
	let { company, onfollow } = $props();
	const following = $derived(isKept(company.key));

	function toggle() {
		const was = following;
		toggleKept(company);
		if (!was) onfollow?.();
	}
</script>

<button type="button" aria-pressed={following ? 'true' : 'false'} onclick={toggle} title={t('collections.private')}>
	<Icon name={following ? 'savedOn' : 'save'} /> {t(following ? 'follow.done' : 'follow.do')}
</button>

<style>
	button[aria-pressed='true'] {
		background: var(--color-soft);
		color: var(--color-ok);
	}
</style>
