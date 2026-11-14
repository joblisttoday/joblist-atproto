<script>
	import config from '#lib/data/config.json';
	import { t } from '#lib/i18n/index.svelte.js';
</script>

<svelte:head><title>{t('notFound.title')} · {config.name}</title></svelte:head>

<h1>{t('notFound.title')}</h1>
<p>{t('notFound.text')}</p>
<p><a href="/">{config.name}</a></p>
