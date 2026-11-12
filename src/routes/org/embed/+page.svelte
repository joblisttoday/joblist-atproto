<script>
	import config from '#lib/data/config.json';
	import Embed from '#lib/components/Embed.svelte';
	import { ownOrganization as org } from '#lib/network/own-organization.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/** Its jobs on its own website: its board's, or its own account's (posting here), one line to paste. */
	const name = $derived(org.company?.name || org.own);
</script>

<svelte:head><title>{t('embed.section')} · {config.name}</title></svelte:head>

<h1>{t('embed.section')}</h1>
{#if org.board}
	<Embed attribute="board" value="{org.board.provider}:{org.board.id}" title={t('embed.title', { name })} />
{:else if org.own}
	<Embed attribute="organization" value={org.own} title={t('embed.title', { name })} />
{/if}
