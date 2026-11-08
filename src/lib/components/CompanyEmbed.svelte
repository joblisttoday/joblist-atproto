<script>
	import Embed from './Embed.svelte';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * An organization's jobs on another website (Embed.svelte), folded on its page.
	 * @type {{company: import('#lib/models/company.js').Company}}
	 */
	let { company } = $props();
</script>

<jl-company-embed>
	<details>
		<summary>{t('embed.section')}</summary>
		<Embed attribute="company" value={company.key} title={t('embed.title', { name: company.name })} />
	</details>
</jl-company-embed>

<style>
	jl-company-embed {
		display: block;
		margin-top: var(--space-l);
	}
</style>
