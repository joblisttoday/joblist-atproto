<script>
	import Embed from './Embed.svelte';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * An organization's jobs on another website (Embed.svelte): folded on its page, open for
	 * its own account (and from its link, #company-embed).
	 * @type {{company: import('#lib/models/company.js').Company, open?: boolean}}
	 */
	let { company, open = false } = $props();
</script>

<jl-company-embed>
	<details id="company-embed" {open}>
		<summary>{t('embed.section')}</summary>
		<!-- Its board: read live, no index between it and the site; else its domain. -->
		{#if company.jobBoard?.provider && company.jobBoard.id}
			<Embed attribute="board" value="{company.jobBoard.provider}:{company.jobBoard.id}" title={t('embed.title', { name: company.name })} />
		{:else}
			<Embed attribute="company" value={company.key} title={t('embed.title', { name: company.name })} />
		{/if}
	</details>
</jl-company-embed>

<style>
	jl-company-embed {
		display: block;
		margin-top: var(--space-l);
	}
</style>
