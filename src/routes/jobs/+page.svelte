<script>
	import config from '#lib/data/config.json';
	import Explore from '#lib/components/Explore.svelte';
	import { t } from '#lib/i18n/index.svelte.js';
</script>

<svelte:head><title>{t('jobs.title')} · {config.name}</title></svelte:head>

<jl-visually-hidden><h1>{t('jobs.title')}</h1></jl-visually-hidden>

<!-- Every job: search, filters, view and the job open after the "#" (/jobs#q=design&where=Berlin). -->
<Explore path="/jobs" />
