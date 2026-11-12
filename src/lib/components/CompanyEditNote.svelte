<script>
	import Author from './Author.svelte';
	import EditTime from './EditTime.svelte';
	import { session } from '#lib/auth/session.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * What the form starts from, and that saving writes the organization's own record.
	 * @type {{company: import('#lib/models/company.js').Company | null}}
	 */
	let { company } = $props();
</script>

<jl-company-edit-note>
	{#if company}
		<p>
			<small>
				{t('form.edit.from')} <Author did={company.record.did} /> · <EditTime datetime={company.editedAt} />
			</small>
		</p>
	{/if}
	<p><small>{t('form.save.own', { domain: company?.key || session.handle || '' })}</small></p>
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
</style>
