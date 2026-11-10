<script>
	import { t } from '#lib/i18n/index.svelte.js';
</script>

<!-- A page waiting for its record: it says so, in words too. -->
<jl-pending role="status">
	<progress aria-label={t('network.loading')}></progress>
	<small>{t('network.loading')}</small>
</jl-pending>

<style>
	jl-pending {
		display: block;
		margin: var(--space-l) 0;
	}
	progress {
		width: 100%;
	}
	small {
		color: var(--color-muted);
	}
</style>
