<script>
	import Author from './Author.svelte';
	import EditTime from './EditTime.svelte';
	import { session } from '#lib/auth/session.svelte.js';
	import { saveVersion } from '#lib/network/save-version.js';
	import { uncheckedLabel } from '#lib/models/company.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/** @type {{company: import('#lib/models/company.js').Company}} */
	let { company } = $props();
	let busy = $state(false);
	/** @type {string | null} */
	let error = $state(null);

	/** A person checked the crawler's version: save it as theirs. */
	async function confirm() {
		busy = true;
		error = null;
		try {
			await saveVersion(company, company.record);
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
		} finally {
			busy = false;
		}
	}
</script>

<jl-company-edited unchecked={company.unchecked || undefined}>
	<p>
		<small>
			{#if company.unchecked}{t(uncheckedLabel(company.record))}{:else}{t('company.editedBy')} <Author did={company.record.did} />{/if}
			· <EditTime datetime={company.editedAt} />
		</small>
	</p>
	{#if company.unchecked && session.did}
		<menu>
			<button type="button" onclick={confirm} disabled={busy}>{busy ? t('form.saving') : t('company.confirm')}</button>
		</menu>
		<p><small>{t('company.confirm.help')}</small></p>
	{/if}
	{#if error}<p role="alert">{error}</p>{/if}
</jl-company-edited>

<style>
	jl-company-edited {
		display: block;
	}
	jl-company-edited[unchecked] > p:first-child small {
		color: var(--color-warn);
	}
	menu {
		margin: 0 0 var(--space-xs);
	}
	button {
		font-size: var(--font-size-small);
	}
</style>
