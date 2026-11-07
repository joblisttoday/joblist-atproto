<script>
	import { page } from '$app/state';
	import config from '#lib/data/config.json';
	import NotFound from '#lib/components/NotFound.svelte';
	import { t } from '#lib/i18n/index.svelte.js';

	const missing = $derived(page.status === 404);
	const title = $derived(missing ? t('notFound.title') : t('error.title'));
</script>

<svelte:head><title>{title} · {config.name}</title></svelte:head>

<NotFound {title} text={missing ? t('notFound.path', { path: page.url.pathname }) : t('error.text')} />
