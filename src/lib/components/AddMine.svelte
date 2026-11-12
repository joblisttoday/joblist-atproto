<script>
	import { session } from '#lib/auth/session.svelte.js';
	import { data } from '#lib/network/network.svelte.js';
	import { ownDomain } from '#lib/models/company.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Signed in with a domain handle: that domain may be the person's company.
	 * Describing it from this account makes its page the company's own (verified).
	 * Handles on a shared host (name.bsky.social) are people, not companies.
	 */
	const domain = $derived(ownDomain(session.handle));
	const company = $derived(domain ? data.companies.get(domain) : undefined);
	const href = $derived(company ? `/${domain}` : `/add?url=${encodeURIComponent(`https://${domain}`)}`);
</script>

{#if domain && !company?.verified}
	<jl-add-mine>
		<p>
			{company ? t('add.mine.claim', { domain }) : t('add.mine.new', { domain })}
			<a {href}>{company ? t('add.mine.open', { name: company.name }) : t('add.mine.describe', { domain })}</a>
		</p>
	</jl-add-mine>
{/if}

<style>
	jl-add-mine {
		display: block;
		margin: var(--space-m) 0;
		padding: var(--space-s) var(--space-m);
		border: var(--border);
		border-radius: var(--radius);
	}
	p {
		margin: 0;
	}
</style>
