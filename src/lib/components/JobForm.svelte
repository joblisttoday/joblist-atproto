<script>
	import config from '#lib/data/config.json';
	import LocationFields from './LocationFields.svelte';
	import { tid } from '#lib/atproto.js';
	import { companyRecord, jobForm, jobRecord, newPlaces, toCompany } from '#lib/records.js';
	import { putRecord, session } from '#lib/session.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * A job offer, posted (or changed) from the organization's own account: written over the
	 * one it edits (fields not shown here are kept), shown for the days chosen from now. On
	 * site or hybrid, where: the organization's places in a tap, or a new one, which may be
	 * added to its places too.
	 * @type {{company: string, companyValue?: Record<string, any> | null, rkey?: string, value?: Record<string, any> | null, onsaved: (rkey: string) => void, oncancel: () => void}}
	 *   companyValue: its organization's record, for its places.
	 */
	let { company, companyValue = null, rkey = '', value = null, onsaved, oncancel } = $props();
	// svelte-ignore state_referenced_locally
	const form = $state(jobForm(value));
	const places = $derived(toCompany(companyValue || {}).locations);
	const adding = $derived(newPlaces(places, form.locations));
	let addToCompany = $state(true);
	const days = [...new Set([...config.jobPost.dayChoices, form.days])].sort((a, b) => a - b);
	let saving = $state(false);
	let error = $state('');

	/** @param {SubmitEvent} event */
	async function submit(event) {
		event.preventDefault();
		saving = true;
		error = '';
		const key = rkey || tid();
		try {
			await putRecord(config.collections.job, key, jobRecord(form, { company, did: /** @type {string} */ (session.did), rkey: key }, value));
			if (form.remote !== 'remote' && adding.length && addToCompany) {
				await putRecord(config.collections.company, company, companyRecord({ locations: [...places, ...adding] }, companyValue, { domain: company }));
			}
			onsaved(key);
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
			saving = false;
		}
	}
</script>

<form onsubmit={submit}>
	<label>{t('post.field.title')}<input bind:value={form.title} required maxlength={config.jobPost.titleMax} /></label>
	<label>{t('post.field.description')}<textarea bind:value={form.description} maxlength={config.jobPost.descriptionMax}></textarea></label>
	<label>
		{t('post.field.remote')}
		<select bind:value={form.remote}>
			<option value="">{t('form.none')}</option>
			{#each config.jobPost.remote as remote (remote)}<option value={remote}>{t(`job.remote.${remote}`)}</option>{/each}
		</select>
	</label>
	{#if form.remote !== 'remote'}
		<LocationFields bind:locations={form.locations} suggested={places} legend={t('post.field.places')} />
		{#if adding.length}
			<label data-check><input type="checkbox" bind:checked={addToCompany} />{t('post.addPlaces', { count: adding.length })}</label>
		{/if}
	{/if}
	<label>
		{t('post.field.employment')}
		<select bind:value={form.employment}>
			<option value="">{t('form.none')}</option>
			{#each config.jobPost.employment as employment (employment)}<option value={employment}>{t(`job.employment.${employment}`)}</option>{/each}
		</select>
	</label>
	<label>{t('post.field.apply')} <small>{t('post.field.apply.help')}</small><input bind:value={form.apply} inputmode="url" /></label>
	<label>
		{t('post.field.days')}
		<select bind:value={form.days}>
			{#each days as n (n)}<option value={n}>{t('post.days', { count: n })}</option>{/each}
		</select>
	</label>
	{#if error}<p role="alert">{t('form.failed', { error })}</p>{/if}
	<menu>
		<button type="submit" disabled={saving}>{saving ? t('form.saving') : t('form.save')}</button>
		<button type="button" onclick={oncancel}>{t('form.cancel')}</button>
	</menu>
</form>

<style>
	[data-check] {
		display: flex;
		align-items: center;
		gap: var(--space-s);
		min-height: var(--tap-size);
		font-weight: normal;
	}
	[data-check] input {
		width: 1.25rem;
		height: 1.25rem;
		min-height: 0;
		margin: 0;
		accent-color: var(--color-accent);
	}
</style>
