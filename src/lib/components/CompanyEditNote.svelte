<script>
	import Author from './Author.svelte';
	import EditTime from './EditTime.svelte';
	import { session } from '#lib/auth/session.svelte.js';
	import { saveOutcome } from '#lib/models/company-form.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * What the form starts from and what saving does: the person's own version,
	 * shown to everyone unless the company publishes its own.
	 * @type {{company: import('#lib/models/company.js').Company | null}}
	 */
	let { company } = $props();
	const outcome = $derived(saveOutcome(company, session.handle || ''));
</script>

<jl-company-edit-note {outcome}>
	{#if company}
		<p>
			<small>
				{t('form.edit.from')} <Author did={company.record.did} /> · <EditTime datetime={company.editedAt} />
			</small>
		</p>
	{/if}
	<p><small>{t(`form.save.${company ? outcome : 'new'}`, { name: company?.name || '', domain: company?.key || '' })}</small></p>
</jl-company-edit-note>

<style>
	jl-company-edit-note {
		display: block;
		max-width: var(--reading-width);
		margin-bottom: var(--space-s);
		padding: var(--space-s) var(--space-m);
		border-radius: var(--radius);
		background: var(--color-soft);
	}
	p {
		margin: 0;
	}
	jl-company-edit-note[outcome='behindOwn'] p:last-child small {
		color: var(--color-warn);
	}
</style>
