<script>
	import { goto } from '$app/navigation';
	import config from '#lib/data/config.json';
	import { deleteRecord } from '#lib/atproto/write.js';
	import { session } from '#lib/auth/session.svelte.js';
	import { data, removeLocal } from '#lib/network/network.svelte.js';
	import { boardUrl } from '#lib/models/company.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/** @type {{company: import('#lib/models/company.js').Company}} */
	let { company } = $props();
	const own = $derived(company.versions.find((v) => v.did === session.did));
	const board = $derived(boardUrl(company.jobBoard));
	/** @type {string | null} */
	let error = $state(null);

	async function remove() {
		if (!own || !confirm(t('company.confirmDelete'))) return;
		try {
			await deleteRecord(config.collections.company, company.key);
			removeLocal('company', own.uri);
			if (!data.companies.has(company.key)) await goto('/companies');
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
		}
	}
</script>

<jl-company-header verified={company.verified || undefined}>
	<header>
		<h1>{company.name}</h1>
		<p>
			<small>
				{#if company.url}<a href={company.url} target="_blank" rel="noopener">{company.key}</a>{:else}{company.key}{/if}
				{#if company.verified}· <span>✓ {t('company.verified', { domain: company.key })}</span>{/if}
			</small>
		</p>
		{#if company.description}<p>{company.description}</p>{/if}
		{#if company.tags.length}
			<ul aria-label={t('form.tags')}>
				{#each company.tags as tag (tag)}<li><a href="/companies?q={encodeURIComponent(tag)}">{tag}</a></li>{/each}
			</ul>
		{/if}
		<menu>
			{#if board}<a href={board} target="_blank" rel="noopener">{t('company.jobBoard')} ↗</a>{/if}
			{#if company.url}<a href={company.url} target="_blank" rel="noopener">{t('company.website')} ↗</a>{/if}
			<a href="/add?key={encodeURIComponent(company.key)}">{own ? t('company.edit') : t('company.improve')}</a>
			{#if own}<button type="button" onclick={remove}>{t('company.delete')}</button>{/if}
		</menu>
		{#if error}<p role="alert">{error}</p>{/if}
	</header>
</jl-company-header>

<style>
	jl-company-header {
		display: block;
	}
	h1 {
		margin-bottom: var(--space-xs);
	}
	span {
		color: var(--color-ok);
	}
	ul {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-xs);
		margin-bottom: var(--space-m);
	}
	ul a {
		display: inline-flex;
		align-items: center;
		min-height: var(--tap-size);
		padding: 0 var(--space-s);
		border-radius: var(--radius-round);
		background: var(--color-soft);
		font-size: var(--font-size-small);
		text-decoration: none;
	}
	menu > * {
		font-size: var(--font-size-small);
	}
</style>
