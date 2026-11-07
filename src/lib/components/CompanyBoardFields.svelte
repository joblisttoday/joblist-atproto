<script>
	import Icon from './Icon.svelte';
	import ChoiceChips from './ChoiceChips.svelte';
	import config from '#lib/data/config.json';
	import providers from '#lib/data/providers.json';
	import { checkBoard } from '#lib/ats/board-check.js';
	import { boardUrl } from '#lib/models/company.js';
	import { readBoardInput } from '#lib/models/company-form.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Where the company posts its jobs: a job board (its provider in a tap, then its
	 * id, checked live for open jobs), or any careers page. A board link pasted in
	 * either field is read as the board.
	 * @type {{provider: string, boardId: string, careersUrl: string, params: Record<string, string>}}
	 */
	let { provider = $bindable(), boardId = $bindable(), careersUrl = $bindable(), params } = $props();

	const options = $derived([
		...providers.map((p) => ({ value: p.id, label: p.name })),
		{ value: '', label: t('form.provider.none') }
	]);
	const providerName = $derived(providers.find((p) => p.id === provider)?.name || '');
	const id = $derived(boardId.trim());
	const link = $derived(provider && id ? boardUrl({ provider, id }) : '');

	/** @type {{state: 'idle' | 'checking' | 'found' | 'none', count?: number}} */
	let check = $state({ state: 'idle' });
	// Check the board once typing pauses; a newer check replaces the one before.
	$effect(() => {
		const board = provider && id ? { provider, id } : null;
		if (!board) {
			check = { state: 'idle' };
			return;
		}
		let current = true;
		const timer = setTimeout(() => {
			check = { state: 'checking' };
			checkBoard(board)
				.then(({ count }) => current && (check = count ? { state: 'found', count } : { state: 'none' }))
				.catch(() => current && (check = { state: 'none' }));
		}, config.companyForm.boardCheckDelayMs);
		return () => {
			current = false;
			clearTimeout(timer);
		};
	});

	/** A whole board link pasted: its provider and id. @param {string} text */
	function readPasted(text) {
		const board = readBoardInput(text);
		if (!board) return;
		provider = board.provider;
		boardId = board.id;
		careersUrl = '';
	}
</script>

<jl-board-fields>
	<fieldset>
		<legend>{t('form.section.jobs')}</legend>
		<small>{t('form.section.jobs.help')}</small>
		<ChoiceChips name="provider" legend={t('form.provider')} {options} bind:value={provider} tool={params.provider} />

		{#if provider}
			<label for="board">{t('form.boardId', { provider: providerName })}</label>
			<input
				id="board"
				name="boardId"
				toolparamdescription={params.boardId}
				bind:value={boardId}
				oninput={(e) => readPasted(e.currentTarget.value)}
				autocapitalize="none"
				autocomplete="off"
				spellcheck="false"
				required
				aria-describedby="board-help"
			/>
			<small id="board-help" aria-live="polite" data-check={check.state}>
				{#if check.state === 'checking'}{t('form.board.checking')}
				{:else if check.state === 'found'}<Icon name="added" /> {t('form.board.found', { count: check.count || 0 })}
				{:else if check.state === 'none'}{t('form.board.none')}
				{:else}{t('form.boardId.help')}{/if}
				{#if link}<a href={link} target="_blank" rel="noopener">{link} <Icon name="external" /></a>{/if}
			</small>
		{:else}
			<label for="careers">{t('form.careersUrl')}</label>
			<input
				id="careers"
				name="careersUrl"
				toolparamdescription={params.careersUrl}
				bind:value={careersUrl}
				oninput={(e) => readPasted(e.currentTarget.value)}
				type="text"
				inputmode="url"
				autocapitalize="none"
				spellcheck="false"
				placeholder="https://"
				aria-describedby="careers-help"
			/>
			<small id="careers-help">{t('form.careersUrl.help')}</small>
		{/if}
	</fieldset>
</jl-board-fields>

<style>
	small {
		display: block;
		overflow-wrap: anywhere;
	}
	small a {
		display: block;
	}
	small[data-check='found'] {
		color: var(--color-ok);
	}
	small[data-check='none'] {
		color: var(--color-warn);
	}
</style>
