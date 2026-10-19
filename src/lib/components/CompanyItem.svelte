<script>
	import { t } from '#lib/i18n/index.svelte.js';

	/** @type {{company: import('#lib/models/company.js').Company}} */
	let { company } = $props();
	const places = $derived(
		[...new Set(company.locations.map((l) => l.name).filter(Boolean))].slice(0, 3).join(', ')
	);
	const about = $derived([places, company.tags.slice(0, 3).join(' · ')].filter(Boolean).join(' — '));
</script>

<jl-company verified={company.verified || undefined}>
	<a href="/company/{company.key}">{company.name}</a>
	{#if company.verified}<span role="img" aria-label={t('company.verified', { domain: company.key })} title={t('company.verified', { domain: company.key })}>✓</span>{/if}
	{#if about}<small>{about}</small>{/if}
</jl-company>

<style>
	jl-company {
		display: block;
		position: relative;
		padding: var(--space-s) 0;
		border-bottom: var(--border);
	}
	a {
		font-weight: var(--font-weight-strong);
		text-decoration: none;
	}
	/* The whole row opens the company. */
	a::after {
		content: '';
		position: absolute;
		inset: 0;
	}
	a:hover {
		text-decoration: underline;
	}
	span {
		color: var(--color-ok);
	}
	small {
		display: block;
	}
</style>
