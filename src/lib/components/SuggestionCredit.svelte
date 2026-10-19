<script>
	import Author from './Author.svelte';
	import { session } from '#lib/auth/session.svelte.js';
	import { updateList } from '#lib/network/save-list.js';
	import { withdraw } from '#lib/network/save-suggestion.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Who added a company to an open list, with what the list's author
	 * (hide it) or the contributor (take it back) can do about it.
	 * @type {{list: import('#lib/models/list.js').List, suggestion: import('#lib/models/suggestion.js').Suggestion}}
	 */
	let { list, suggestion } = $props();
	let busy = $state(false);
	/** @type {string | null} */
	let error = $state(null);

	/** @param {() => Promise<void>} action */
	async function run(action) {
		busy = true;
		error = null;
		try {
			await action();
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
		} finally {
			busy = false;
		}
	}
</script>

<jl-suggestion-credit>
	<small>
		{t('suggestion.addedBy')} <Author did={suggestion.did} />{#if suggestion.note}: “{suggestion.note}”{/if}
	</small>
	{#if session.did === list.did}
		<button type="button" disabled={busy} onclick={() => run(() => updateList(list, { hidden: [...list.hidden, suggestion.company] }))}>
			{t('suggestion.hide')}
		</button>
	{:else if session.did === suggestion.did}
		<button type="button" disabled={busy} onclick={() => run(() => withdraw(suggestion))}>{t('suggestion.withdraw')}</button>
	{/if}
	{#if error}<p role="alert">{error}</p>{/if}
</jl-suggestion-credit>

<style>
	jl-suggestion-credit {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-s);
	}
	button {
		min-height: auto;
		padding: var(--space-xs) var(--space-s);
		font-size: var(--font-size-small);
	}
</style>
