<script>
	import providers from '#lib/data/providers.json';
	import config from '#lib/data/config.json';
	import LocationFields from './LocationFields.svelte';
	import { putRecord } from '#lib/atproto/write.js';
	import { session } from '#lib/auth/session.svelte.js';
	import { upsertLocal } from '#lib/network/network.svelte.js';
	import { boardUrl, toDomain, toForm, toRecord } from '#lib/models/company.js';
	import { withPrefill } from '#lib/models/paste.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * @type {{
	 *   company?: import('#lib/models/company.js').Company | null,
	 *   prefill?: Parameters<typeof withPrefill>[1],
	 *   onsaved: (key: string) => void,
	 *   oncancel?: () => void
	 * }}
	 */
	let { company = null, prefill = {}, onsaved, oncancel } = $props();

	const editing = $derived(Boolean(company));
	const own = $derived(company?.versions.find((v) => v.did === session.did));
	// The form starts from the company as it is now, its gaps filled from what was pasted;
	// the page remounts it for another company.
	const initialForm = () => withPrefill(toForm(company), prefill);
	let form = $state(initialForm());
	let busy = $state(false);
	/** @type {string | null} */
	let error = $state(null);

	const key = $derived(company ? company.key : toDomain(form.url));
	const board = $derived(form.provider && form.boardId.trim() ? boardUrl({ provider: form.provider, id: form.boardId.trim() }) : '');
	// Optional parts start folded, unless they already hold something.
	const hasBoard = Boolean(form.provider || form.careersUrl);
	const hasMore = Boolean(form.tags || form.locations.length || form.links);

	/** @param {SubmitEvent} event */
	async function submit(event) {
		event.preventDefault();
		if (!key) return;
		busy = true;
		error = null;
		try {
			const record = toRecord(form, own?.value.createdAt);
			const res = await putRecord(config.collections.company, key, record);
			upsertLocal('company', {
				did: /** @type {string} */ (session.did),
				rkey: key,
				uri: res.uri,
				cid: res.cid,
				value: record
			});
			onsaved(key);
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
		} finally {
			busy = false;
		}
	}
</script>

<jl-company-form editing={editing || undefined}>
	<form onsubmit={submit}>
		{#if editing}<p><small>{t('form.ownVersion')}</small></p>{/if}

		<label for="url">{t('form.website')}</label>
		<input
			id="url"
			bind:value={form.url}
			type="url"
			inputmode="url"
			autocapitalize="none"
			spellcheck="false"
			placeholder="https://"
			required={!editing}
			aria-describedby="url-help"
		/>
		<small id="url-help">{t('form.website.help')} {#if key}<b>{key}</b>{/if}</small>

		<label for="name">{t('form.name')}</label>
		<input id="name" bind:value={form.name} required maxlength="100" autocomplete="organization" />

		<label for="description">{t('form.description')}</label>
		<textarea id="description" bind:value={form.description} maxlength="3000"></textarea>

		<details open={hasBoard}>
			<summary>{t('form.section.jobs')}</summary>
			<label for="provider">{t('form.provider')}</label>
			<select id="provider" bind:value={form.provider}>
				<option value="">{t('form.provider.none')}</option>
				{#each providers as provider (provider.id)}
					<option value={provider.id}>{provider.name}</option>
				{/each}
			</select>

			{#if form.provider}
				<label for="board">{t('form.boardId')}</label>
				<input id="board" bind:value={form.boardId} autocapitalize="none" spellcheck="false" required aria-describedby="board-help" />
				<small id="board-help">
					{#if board}<a href={board} target="_blank" rel="noopener">{board}</a>{:else}{t('form.boardId.help')}{/if}
				</small>
			{:else}
				<label for="careers">{t('form.careersUrl')}</label>
				<input id="careers" bind:value={form.careersUrl} type="url" inputmode="url" autocapitalize="none" placeholder="https://" />
			{/if}
		</details>

		<details open={hasMore}>
			<summary>{t('form.section.more')}</summary>
			<label for="tags">{t('form.tags')}</label>
			<input id="tags" bind:value={form.tags} autocapitalize="none" aria-describedby="tags-help" />
			<small id="tags-help">{t('form.tags.help')}</small>

			<LocationFields bind:locations={form.locations} />

			<label for="links">{t('form.links')}</label>
			<textarea id="links" bind:value={form.links} autocapitalize="none" spellcheck="false" aria-describedby="links-help"></textarea>
			<small id="links-help">{t('form.links.help')}</small>
		</details>

		{#if error}<p role="alert">{error}</p>{/if}
		<menu>
			<button type="submit" disabled={busy || !key}>{busy ? t('form.saving') : t('form.save')}</button>
			{#if oncancel}<button type="button" onclick={oncancel}>{t('form.cancel')}</button>{/if}
		</menu>
	</form>
</jl-company-form>

<style>
	details {
		margin-top: var(--space-l);
		padding-top: var(--space-s);
		border-top: var(--border);
	}
	small {
		overflow-wrap: anywhere;
	}
</style>
