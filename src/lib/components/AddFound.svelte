<script>
	import providers from '#lib/data/providers.json';
	import { boardUrl } from '#lib/models/company.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * What the pasted link led to: a live job board, a company already on joblist.
	 * @type {{
	 *   board: {provider: string, id: string} | null,
	 *   count?: number,
	 *   existing: import('#lib/models/company.js').Company | null
	 * }}
	 */
	let { board, count = 0, existing } = $props();

	const provider = $derived(providers.find((p) => p.id === board?.provider)?.name || '');
	const status = $derived(!board ? undefined : count ? 'live' : 'empty');
</script>

{#if board || existing}
	<jl-add-found {status} existing={existing ? true : undefined} aria-live="polite">
		{#if board}
			<p>
				{count ? t('add.jobs', { count, provider }) : t('add.jobs.none', { provider })}
				<small><a href={boardUrl(board)} target="_blank" rel="noopener">{boardUrl(board)} ↗</a></small>
			</p>
		{/if}
		{#if existing}
			<p>
				{t('add.existing')} <a href="/company/{existing.key}">{existing.name}</a>.
				<small>{t('add.existing.help')}</small>
			</p>
		{/if}
	</jl-add-found>
{/if}

<style>
	jl-add-found {
		display: block;
		margin: var(--space-m) 0;
		padding: var(--space-s) var(--space-m);
		border: var(--border);
		border-radius: var(--radius);
		background: var(--color-soft);
	}
	jl-add-found[status='live'] {
		border-color: var(--color-ok);
	}
	p {
		margin: var(--space-xs) 0;
	}
	small {
		display: block;
		overflow-wrap: anywhere;
	}
</style>
