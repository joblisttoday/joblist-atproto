<script>
	import LocationFields from './LocationFields.svelte';
	import Icon from './Icon.svelte';
	import config from '#lib/data/config.json';
	import { companyForm, companyRecord } from '#lib/records.js';
	import { putRecord } from '#lib/session.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * One part of describing one's organization (config companyForm.sections: about, kind,
	 * tags, places, links): its record (keyed by its domain) written in its own account, over
	 * the one it had; only this part's fields change.
	 * @type {{domain: string, section: string, value: Record<string, any> | null, onsaved: () => void, oncancel: () => void}}
	 */
	let { domain, section, value, onsaved, oncancel } = $props();
	// svelte-ignore state_referenced_locally
	const form = $state(companyForm(domain, value));
	if (!form.links.length) form.links.push('');
	const kinds = ['company', 'cooperative', 'nonprofit', 'collective', 'project', 'public'];
	const id = $props.id();
	let saving = $state(false);
	let error = $state('');

	/** This part's fields, alone. */
	function part() {
		const f = $state.snapshot(form);
		if (section === 'about') return { name: f.name, url: f.url, description: f.description };
		if (section === 'kind') return { kind: f.kind };
		if (section === 'tags') return { tags: f.tags };
		if (section === 'places') return { locations: f.locations };
		return { links: f.links };
	}

	/** @param {SubmitEvent} event */
	async function submit(event) {
		event.preventDefault();
		saving = true;
		error = '';
		try {
			await putRecord(config.collections.company, domain, companyRecord(part(), value, { domain }));
			onsaved();
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
			saving = false;
		}
	}
</script>

<form onsubmit={submit}>
	{#if section === 'about'}
		<label>{t('company.name')}<input bind:value={form.name} required maxlength="100" /></label>
		<label>{t('company.url')}<input bind:value={form.url} type="url" inputmode="url" /></label>
		<label>{t('company.description')}<textarea bind:value={form.description} maxlength="3000"></textarea></label>
	{:else if section === 'kind'}
		<fieldset>
			<legend>{t('company.kind')}</legend>
			{#each ['', ...kinds] as kind (kind)}
				<label data-choice><input type="radio" name="kind" value={kind} bind:group={form.kind} />{kind ? t(`kind.${kind}`) : t('kind.none')}</label>
			{/each}
		</fieldset>
	{:else if section === 'tags'}
		<label>{t('company.tags')} <small>{t('company.tags.help')}</small><input bind:value={form.tags} /></label>
	{:else if section === 'places'}
		<LocationFields bind:locations={form.locations} />
	{:else}
		<fieldset>
			<legend>{t('form.links')}</legend>
			<p><small>{t('form.links.help')}</small></p>
			{#each form.links as _, i (i)}
				<div data-link>
					<label for="{id}-{i}"><span data-hidden>{t('form.link', { number: i + 1 })}</span></label>
					<input id="{id}-{i}" bind:value={form.links[i]} inputmode="url" placeholder="bsky.app/profile/{domain}" />
					<button type="button" data-remove aria-label={t('form.link.remove', { number: i + 1 })} onclick={() => form.links.splice(i, 1)}><Icon name="close" /></button>
				</div>
			{/each}
			{#if form.links.length < config.companyForm.linksMax}
				<p><button type="button" data-add onclick={() => form.links.push('')}><Icon name="post" />{form.links.length ? t('form.link.another') : t('form.link.add')}</button></p>
			{/if}
		</fieldset>
	{/if}
	{#if error}<p role="alert">{t('form.failed', { error })}</p>{/if}
	<menu>
		<button type="submit" data-primary disabled={saving}>{saving ? t('form.saving') : t('form.save')}</button>
		<button type="button" onclick={oncancel}>{t('form.cancel')}</button>
	</menu>
</form>

<style>
	fieldset {
		margin: 0;
		padding: 0;
		border: 0;
	}
	legend {
		margin-bottom: var(--space-s);
		padding: 0;
		font-weight: var(--font-weight-strong);
	}
	[data-choice] {
		display: flex;
		align-items: center;
		gap: var(--space-s);
		min-height: var(--tap-size);
		font-weight: normal;
	}
	[data-choice] input {
		width: 1.25rem;
		height: 1.25rem;
		min-height: 0;
		margin: 0;
		accent-color: var(--color-accent);
	}
	[data-link] {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		margin-bottom: var(--space-s);
	}
	[data-link] input {
		flex: 1;
	}
	[data-hidden] {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
	}
	[data-remove] {
		flex: none;
		width: var(--tap-size);
		padding: 0;
		border: 0;
		background: none;
		color: var(--color-muted);
	}
	[data-add] {
		gap: var(--space-xs);
	}
</style>
