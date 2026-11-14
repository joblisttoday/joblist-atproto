<script>
	import config from '#lib/data/config.json';
	import { companyForm, companyRecord } from '#lib/records.js';
	import { putRecord } from '#lib/session.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Describing one's organization: its record (keyed by its domain) written in its own
	 * account, over the one it had (fields not shown here are kept).
	 * @type {{domain: string, value: Record<string, any> | null, onsaved: () => void, oncancel: () => void}}
	 */
	let { domain, value, onsaved, oncancel } = $props();
	// svelte-ignore state_referenced_locally
	const form = $state(companyForm(domain, value));
	const kinds = ['company', 'cooperative', 'nonprofit', 'collective', 'project', 'public'];
	let saving = $state(false);
	let error = $state('');

	/** @param {SubmitEvent} event */
	async function submit(event) {
		event.preventDefault();
		saving = true;
		error = '';
		try {
			await putRecord(config.collections.company, domain, companyRecord(form, value));
			onsaved();
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
			saving = false;
		}
	}
</script>

<form onsubmit={submit}>
	<label>{t('company.name')}<input bind:value={form.name} required maxlength="200" /></label>
	<label>{t('company.url')}<input bind:value={form.url} type="url" inputmode="url" /></label>
	<label>{t('company.description')}<textarea bind:value={form.description} maxlength="30000"></textarea></label>
	<label>
		{t('company.kind')}
		<select bind:value={form.kind}>
			<option value="">{t('form.none')}</option>
			{#each kinds as kind (kind)}<option value={kind}>{t(`kind.${kind}`)}</option>{/each}
		</select>
	</label>
	<label>{t('company.tags')} <small>{t('company.tags.help')}</small><input bind:value={form.tags} /></label>
	{#if error}<p role="alert">{t('form.failed', { error })}</p>{/if}
	<menu>
		<button type="submit" disabled={saving}>{saving ? t('form.saving') : t('form.save')}</button>
		<button type="button" onclick={oncancel}>{t('form.cancel')}</button>
	</menu>
</form>
