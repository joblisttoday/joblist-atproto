<script>
	import config from '#lib/data/config.json';
	import Explore from '#lib/components/Explore.svelte';
	import { t } from '#lib/i18n/index.svelte.js';
</script>

<svelte:head><title>{t('jobs.title')} · {config.name}</title></svelte:head>

<!-- Kept for older links to saved searches (/jobs?q=…): the same explorer as the home page. -->
<Explore path="/jobs" />
