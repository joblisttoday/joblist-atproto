<script>
	import Author from './Author.svelte';
	import { t } from '#lib/i18n/index.svelte.js';

	/** @type {{company: import('#lib/models/company.js').Company}} */
	let { company } = $props();
</script>

<jl-company-versions>
	<p>
		<small>
			{t('company.describedBy')} <Author did={company.record.did} />
		</small>
	</p>
	{#if company.versions.length > 1}
		<details>
			<summary>{t('company.versions', { count: company.versions.length })}</summary>
			<ul>
				{#each company.versions as version (version.uri)}
					<li><small><Author did={version.did} /> · {version.value.name}</small></li>
				{/each}
			</ul>
		</details>
	{/if}
</jl-company-versions>

<style>
	jl-company-versions {
		display: block;
		margin-top: var(--space-xl);
		padding-top: var(--space-m);
		border-top: var(--border);
	}
</style>
