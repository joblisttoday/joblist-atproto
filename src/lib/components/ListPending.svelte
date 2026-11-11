<script>
	import Author from './Author.svelte';
	import { data } from '#lib/network/network.svelte.js';
	import { updateList } from '#lib/network/save-list.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Companies others suggested for a closed list, for its author to accept or dismiss (in a sheet, which names them).
	 * @type {{list: import('#lib/models/list.js').List, pending: import('#lib/models/suggestion.js').Suggestion[]}}
	 */
	let { list, pending } = $props();
	/** @type {string | null} */
	let busy = $state(null);
	/** @type {string | null} */
	let error = $state(null);

	/**
	 * @param {string} key
	 * @param {{companies?: string[], hidden?: string[]}} changes
	 */
	async function decide(key, changes) {
		busy = key;
		error = null;
		try {
			await updateList(list, changes);
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
		} finally {
			busy = null;
		}
	}
</script>

<jl-list-pending>
	<ul>
		{#each pending as suggestion (suggestion.uri)}
			{@const company = data.companies.get(suggestion.company)}
			<li>
				<p>
					<a href="/{suggestion.company}">{company?.name || suggestion.company}</a>
					<small>
						{t('suggestion.by')} <Author did={suggestion.did} />{#if suggestion.note}: “{suggestion.note}”{/if}
					</small>
				</p>
				<menu>
					<button
						type="button"
						disabled={busy !== null}
						onclick={() => decide(suggestion.company, { companies: [...list.companies, suggestion.company] })}
					>
						{t('suggestion.accept')}
					</button>
					<button
						type="button"
						disabled={busy !== null}
						onclick={() => decide(suggestion.company, { hidden: [...list.hidden, suggestion.company] })}
					>
						{t('suggestion.dismiss')}
					</button>
				</menu>
			</li>
		{/each}
	</ul>
	{#if error}<p role="alert">{error}</p>{/if}
</jl-list-pending>

<style>
	jl-list-pending {
		display: block;
	}
	li {
		padding: var(--space-s) 0;
		border-top: var(--border);
	}
	p {
		margin: 0;
	}
	a {
		font-weight: var(--font-weight-strong);
	}
	small {
		display: block;
	}
	menu {
		margin: var(--space-s) 0 0;
	}
	menu button {
		font-size: var(--font-size-small);
	}
</style>
