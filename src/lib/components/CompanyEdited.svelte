<script>
	import Author from './Author.svelte';
	import EditTime from './EditTime.svelte';
	import { uncheckedLabel } from '#lib/models/company.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Who wrote the version shown, and when: the crawler, a new account, or a person.
	 * Nothing to confirm: someone who sees something wrong edits it.
	 * @type {{company: import('#lib/models/company.js').Company}}
	 */
	let { company } = $props();
</script>

<jl-company-edited>
	<p>
		<small>
			{#if company.unchecked}{t(uncheckedLabel(company.record))}{:else}{t('company.editedBy')} <Author did={company.record.did} />{/if}
			· <EditTime datetime={company.editedAt} />
		</small>
	</p>
</jl-company-edited>

<style>
	jl-company-edited {
		display: block;
	}
	small {
		color: var(--color-muted);
	}
</style>
