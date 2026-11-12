<script>
	import Icon from './Icon.svelte';
	import providers from '#lib/data/providers.json';
	import { findBoards } from '#lib/network/name-search.js';
	import { formatNumber, t } from '#lib/i18n/index.svelte.js';

	/**
	 * An organization with no job board known: look for one by its name at each provider, only
	 * when asked (a few requests); the boards with open jobs, to pick (onpick).
	 * @type {{name: string, domain?: string, onpick: (board: {provider: string, id: string}) => void}}
	 */
	let { name, domain = '', onpick } = $props();
	/** @type {'idle' | 'busy' | 'done'} */
	let step = $state('idle');
	/** @type {{provider: string, id: string, count: number}[]} */
	let boards = $state([]);

	async function look() {
		step = 'busy';
		boards = await findBoards(name, domain);
		step = 'done';
	}
	/** @param {string} id */
	const providerName = (id) => providers.find((p) => p.id === id)?.name || id;
</script>

<jl-board-finder>
	{#if step === 'idle'}
		<menu><button type="button" onclick={look}><Icon name="search" /> {t('boards.look')}</button></menu>
		<p><small>{t('boards.look.help', { count: providers.length })}</small></p>
	{:else if step === 'busy'}
		<p role="status"><small>{t('boards.looking', { count: providers.length })}</small></p>
	{:else if boards.length}
		<p role="status">{t('boards.found')}</p>
		<menu>
			{#each boards as board (board.provider)}
				<button type="button" onclick={() => onpick(board)}>{providerName(board.provider)} · {t('kept.jobs', { count: formatNumber(board.count) })}</button>
			{/each}
		</menu>
	{:else}
		<p role="status"><small>{t('boards.none')}</small></p>
	{/if}
</jl-board-finder>

<style>
	jl-board-finder {
		display: block;
		margin-top: var(--space-s);
	}
	p {
		margin: var(--space-xs) 0;
	}
	menu {
		flex-wrap: wrap;
		gap: var(--space-xs);
	}
</style>
