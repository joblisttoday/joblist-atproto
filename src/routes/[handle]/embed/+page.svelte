<script>
	import { page } from '$app/state';
	import config from '#lib/data/config.json';
	import Embed from '#lib/components/Embed.svelte';
	import { domainOf } from '#lib/profile.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/** An organization's jobs on a website (/{domain}/embed): a line to paste. Anyone may show them. */
	const domain = $derived(domainOf(page.params.handle || ''));
</script>

<svelte:head><title>{t('embed.section')} · {config.name}</title></svelte:head>

<p><a href="/{domain}">{domain}</a></p>
<h1>{t('embed.section')}</h1>
<Embed {domain} />

<style>
	p:first-child {
		margin-top: var(--space-m);
	}
</style>
