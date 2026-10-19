<script>
	import config from '#lib/data/config.json';
	import Jobs from '#lib/components/Jobs.svelte';
	import NetworkStatus from '#lib/components/NetworkStatus.svelte';
	import { data } from '#lib/network/network.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	const companies = $derived([...data.companies.values()]);
</script>

<svelte:head><title>{t('jobs.title')} · {config.name}</title></svelte:head>

<h1>{t('jobs.title')}</h1>
<p>{t('jobs.intro')}</p>
<menu><a href="/jobs/new">+ {t('post.title')}</a></menu>
{#if companies.length}
	<Jobs {companies} />
{:else}
	<NetworkStatus />
{/if}
