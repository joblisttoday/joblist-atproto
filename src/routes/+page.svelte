<script>
	import config from '#lib/data/config.json';
	import Explore from '#lib/components/Explore.svelte';
	import { t } from '#lib/i18n/index.svelte.js';
</script>

<svelte:head><title>{config.name} · {t('jobs.title')}</title></svelte:head>

<Explore path="/" />
