<script>
	import config from '#lib/data/config.json';
	import { createRecord, putRecord } from '#lib/atproto/write.js';
	import { session } from '#lib/auth/session.svelte.js';
	import { data, upsertLocal } from '#lib/network/network.svelte.js';
	import { toRecord } from '#lib/models/list.js';
	import { searchText } from '#lib/models/company.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * @type {{
	 *   list?: import('#lib/models/list.js').List | null,
	 *   initial?: {name?: string, description?: string, companies?: string[], copiedFrom?: string},
	 *   onsaved: (rkey: string) => void,
	 *   oncancel?: () => void
	 * }}
	 */
	let { list = null, initial = {}, onsaved, oncancel } = $props();

	// The form starts from the list as it is now; the page remounts it for another list.
	const initialForm = () => ({
		name: list?.name ?? initial.name ?? '',
		description: list?.description ?? initial.description ?? '',
		companies: [...(list?.companies ?? initial.companies ?? [])],
		copiedFrom: list?.copiedFrom ?? initial.copiedFrom
	});
	let form = $state(initialForm());
	let query = $state('');
	let busy = $state(false);
	/** @type {string | null} */
	let error = $state(null);

	const suggestions = $derived.by(() => {
		const words = query.toLowerCase().split(/\s+/).filter(Boolean);
		if (!words.length) return [];
		return [...data.companies.values()]
			.filter((c) => !form.companies.includes(c.key))
			.filter((c) => {
				const text = searchText(c);
				return words.every((w) => text.includes(w));
			})
			.slice(0, 8);
	});

	/**
	 * @param {number} i
	 * @param {number} to
	 */
	function move(i, to) {
		const [key] = form.companies.splice(i, 1);
		form.companies.splice(to, 0, key);
	}

	/** @param {SubmitEvent} event */
	async function submit(event) {
		event.preventDefault();
		busy = true;
		error = null;
		try {
			const record = toRecord(form, list?.createdAt);
			const res = list
				? await putRecord(config.collections.list, list.rkey, record)
				: await createRecord(config.collections.list, record);
			const rkey = res.uri.split('/').pop() || '';
			upsertLocal('list', {
				did: /** @type {string} */ (session.did),
				rkey,
				uri: res.uri,
				cid: res.cid,
				value: record
			});
			onsaved(rkey);
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
		} finally {
			busy = false;
		}
	}
</script>

<jl-list-form>
	<form onsubmit={submit}>
		<label for="list-name">{t('form.list.name')}</label>
		<input id="list-name" bind:value={form.name} required maxlength="100" />

		<label for="list-description">{t('form.list.description')}</label>
		<textarea id="list-description" bind:value={form.description} maxlength="3000"></textarea>

		<fieldset>
			<legend>{t('form.list.companies')} ({form.companies.length})</legend>
			<label for="list-add">{t('form.list.add')}</label>
			<input id="list-add" type="search" bind:value={query} placeholder={t('search.companies')} />
			{#if suggestions.length}
				<ul>
					{#each suggestions as company (company.key)}
						<li>
							<button type="button" onclick={() => (form.companies.unshift(company.key), (query = ''))}>
								+ {company.name} <small>{company.key}</small>
							</button>
						</li>
					{/each}
				</ul>
			{/if}
			<ol>
				{#each form.companies as key, i (key)}
					<li>
						<span>
							{data.companies.get(key)?.name || key}
							{#if !data.companies.has(key)}<small>{t('form.list.unknown')}</small>{/if}
						</span>
						<button type="button" onclick={() => move(i, i - 1)} disabled={i === 0} aria-label={t('form.list.up')}>↑</button>
						<button
							type="button"
							onclick={() => move(i, i + 1)}
							disabled={i === form.companies.length - 1}
							aria-label={t('form.list.down')}>↓</button>
						<button type="button" onclick={() => form.companies.splice(i, 1)} aria-label={t('form.list.remove')}>×</button>
					</li>
				{/each}
			</ol>
		</fieldset>

		{#if error}<p role="alert">{error}</p>{/if}
		<menu>
			<button type="submit" disabled={busy}>{busy ? t('form.saving') : t('form.save')}</button>
			{#if oncancel}<button type="button" onclick={oncancel}>{t('form.cancel')}</button>{/if}
		</menu>
	</form>
</jl-list-form>

<style>
	ul button {
		width: 100%;
		text-align: left;
		border: none;
		border-bottom: var(--border);
		border-radius: 0;
	}
	ol li {
		display: flex;
		align-items: center;
		gap: var(--space-xs);
		padding: var(--space-xs) 0;
		border-bottom: var(--border);
	}
	ol span {
		flex: 1;
	}
	ol small {
		display: block;
	}
	ol button {
		min-width: var(--tap-size);
		padding: 0;
	}
</style>
