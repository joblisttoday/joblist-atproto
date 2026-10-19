<script>
	import config from '#lib/data/config.json';
	import { t } from '#lib/i18n/index.svelte.js';
</script>

<svelte:head><title>{t('featured.thanks.title')} · {config.name}</title></svelte:head>

<jl-support-thanks>
	<h1>{t('featured.thanks.title')}</h1>
	<p>{t('support.thanks.text')}</p>
	<p><small>{t('featured.thanks.receipt')}</small></p>
	<menu><a href="/">{t('nav.lists')}</a></menu>
</jl-support-thanks>

<style>
	jl-support-thanks {
		display: block;
	}
</style>
