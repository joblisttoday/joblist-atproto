<script>
	import { hasJobsApi } from '#lib/models/company.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/** @type {{company: import('#lib/models/company.js').Company}} */
	let { company } = $props();
	const places = $derived(
		[...new Set(company.locations.map((l) => l.name).filter(Boolean))].slice(0, 3).join(', ')
	);
</script>

<jl-company verified={company.verified || undefined} jobs={hasJobsApi(company) || undefined}>
	<a href="/company/{company.key}">{company.name}</a>
	{#if company.verified}<span title={t('company.verified', { domain: company.key })}>✓</span>{/if}
	<small>{[places, company.tags.slice(0, 3).join(' · ')].filter(Boolean).join(' — ')}</small>
</jl-company>

<style>
	jl-company {
		display: block;
		padding: var(--space-s) 0;
		border-bottom: var(--border);
	}
	a {
		font-weight: 600;
		text-decoration: none;
	}
	span {
		color: var(--color-ok);
	}
	small {
		display: block;
	}
</style>
