<script>
	import config from '#lib/data/config.json';
	import { putRecord } from '#lib/atproto/write.js';
	import { session } from '#lib/auth/session.svelte.js';
	import { data, upsertLocal } from '#lib/network/network.svelte.js';
	import { toRecord } from '#lib/models/list.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/** @type {{key: string}} */
	let { key } = $props();
	const mine = $derived(data.lists.filter((l) => l.did === session.did));
	/** @type {string | null} */
	let busy = $state(null);

	/** @param {import('#lib/models/list.js').List} list */
	async function toggle(list) {
		busy = list.uri;
		try {
			const companies = list.companies.includes(key)
				? list.companies.filter((k) => k !== key)
				: [...list.companies, key];
			const record = toRecord({ ...list, description: list.description || '', companies }, list.createdAt);
			const res = await putRecord(config.collections.list, list.rkey, record);
			upsertLocal('list', { did: list.did, rkey: list.rkey, uri: res.uri, cid: res.cid, value: record });
		} finally {
			busy = null;
		}
	}
</script>

<jl-add-to-list>
	<h3>{t('company.addToList')}</h3>
	<ul>
		{#each mine as list (list.uri)}
			<li>
				<button type="button" aria-pressed={list.companies.includes(key)} disabled={busy === list.uri} onclick={() => toggle(list)}>
					{list.companies.includes(key) ? '✓' : '+'} {list.name}
				</button>
			</li>
		{/each}
		<li><a href="/lists/new?add={encodeURIComponent(key)}">+ {t('list.new')}</a></li>
	</ul>
</jl-add-to-list>

<style>
	ul {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-s);
	}
	button[aria-pressed='true'] {
		background: var(--color-accent);
		color: var(--color-accent-fg);
	}
</style>
