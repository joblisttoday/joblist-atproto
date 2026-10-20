<script>
	import { t } from '#lib/i18n/index.svelte.js';
</script>

<!-- A page waiting for its record: the global status says what the network is doing. -->
<progress aria-label={t('network.loading')}></progress>

<style>
	progress {
		margin: var(--space-l) 0;
	}
</style>
