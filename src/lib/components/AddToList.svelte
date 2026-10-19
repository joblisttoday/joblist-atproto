<script>
	import { session } from '#lib/auth/session.svelte.js';
	import { data } from '#lib/network/network.svelte.js';
	import { updateList } from '#lib/network/save-list.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/** @type {{key: string}} */
	let { key } = $props();
	const mine = $derived(session.did ? data.lists.filter((l) => l.did === session.did) : []);
	/** @type {string | null} */
	let busy = $state(null);
	/** @type {string | null} */
	let error = $state(null);

	/** @param {import('#lib/models/list.js').List} list */
	async function toggle(list) {
		busy = list.uri;
		error = null;
		try {
			const companies = list.companies.includes(key)
				? list.companies.filter((k) => k !== key)
				: [...list.companies, key];
			await updateList(list, { companies });
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
		} finally {
			busy = null;
		}
	}
</script>

<jl-add-to-list>
	{#if mine.length}<h3>{t('company.addToList')}</h3>{/if}
	<menu>
		{#each mine as list (list.uri)}
			<button type="button" aria-pressed={list.companies.includes(key)} disabled={busy === list.uri} onclick={() => toggle(list)}>
				{list.companies.includes(key) ? '✓' : '+'} {list.name}
			</button>
		{/each}
		<a href="/lists/new?add={encodeURIComponent(key)}">+ {t('company.newList')}</a>
	</menu>
	{#if error}<p role="alert">{error}</p>{/if}
</jl-add-to-list>

<style>
	menu > * {
		font-size: var(--font-size-small);
	}
	button[aria-pressed='true'] {
		background: var(--color-accent);
		color: var(--color-accent-fg);
		border-color: var(--color-accent);
	}
</style>
