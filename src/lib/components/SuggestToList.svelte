<script>
	import Icon from './Icon.svelte';
	import { session } from '#lib/auth/session.svelte.js';
	import { data } from '#lib/network/network.svelte.js';
	import { suggest } from '#lib/network/save-suggestion.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * One tap to put a company in someone else's list: an open list takes it at once
	 * (credited), the author of another list decides.
	 * @type {{list: import('#lib/models/list.js').List, company: string}}
	 */
	let { list, company } = $props();
	const done = $derived(
		data.suggestions.some((s) => s.did === session.did && s.list === list.uri && s.company === company)
	);
	let busy = $state(false);
	/** @type {string | null} */
	let error = $state(null);

	async function send() {
		busy = true;
		error = null;
		try {
			await suggest({ list: list.uri, company });
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
		} finally {
			busy = false;
		}
	}
</script>

<jl-suggest-to-list open={list.open || undefined} done={done || undefined}>
	{#if done}
		<small role="status"><Icon name="added" /> {t(list.open ? 'suggestion.added' : 'suggestion.suggested')}</small>
	{:else}
		<button type="button" disabled={busy} onclick={send}>
			<Icon name="add" /> {t(list.open ? 'suggestion.add' : 'suggestion.send')}
		</button>
	{/if}
	{#if error}<p role="alert">{error}</p>{/if}
</jl-suggest-to-list>

<style>
	jl-suggest-to-list {
		display: block;
	}
	button {
		font-size: var(--font-size-small);
	}
	small {
		color: var(--color-ok);
	}
</style>
