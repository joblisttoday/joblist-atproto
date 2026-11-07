<script>
	import Icon from './Icon.svelte';
	import { missingFields } from '#lib/models/company-form.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * A part of the company page nobody has filled in yet: a small link to the
	 * form, opened on that part. Shown only while it is missing.
	 * @type {{company: import('#lib/models/company.js').Company, field: ReturnType<typeof missingFields>[number]}}
	 */
	let { company, field } = $props();
	const missing = $derived(missingFields(company).includes(field));
	const href = $derived(`/add?${new URLSearchParams({ key: company.key, field })}`);
</script>

{#if missing}
	<jl-company-invite {field}>
		<a {href} data-add><Icon name="add" /> {t(`invite.${field}`)}</a>
	</jl-company-invite>
{/if}

<style>
	/* Side by side when a few are missing. */
	jl-company-invite {
		display: inline-block;
		margin: 0 var(--space-xs) var(--space-s) 0;
	}
</style>
