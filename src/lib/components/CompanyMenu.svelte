<script>
	import CardMenu from './CardMenu.svelte';
	import Icon from './Icon.svelte';
	import { boardUrl } from '#lib/models/company.js';
	import { isSaved, toggleSaved } from '#lib/network/local-lists.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * An organization card's "…": save it (in this browser), its job board, its website, its link.
	 * @type {{company: import('#lib/models/company.js').Company}}
	 */
	let { company } = $props();
	const saved = $derived(isSaved(company.key));
	const board = $derived(boardUrl(company.jobBoard));
	let copied = $state(false);

	/** @param {() => void} done */
	async function copy(done) {
		try {
			await navigator.clipboard.writeText(new URL(`/company/${company.key}`, location.href).href);
			copied = true;
			setTimeout(() => ((copied = false), done()), 1200);
		} catch {
			done();
		}
	}
</script>

<CardMenu label={t('card.actions', { name: company.name })}>
	{#snippet items(done)}
		<li><button type="button" onclick={() => (toggleSaved(company.key, t('company.saved.list')), done())}><Icon name={saved ? 'savedOn' : 'save'} /> {t(saved ? 'collections.saved' : 'collections.save')}</button></li>
		{#if board}<li><a href={board} target="_blank" rel="noopener" onclick={done}><Icon name="external" /> {t('company.jobBoard')}</a></li>{/if}
		{#if company.url}<li><a href={company.url} target="_blank" rel="noopener" onclick={done}><Icon name="external" /> {t('card.website')}</a></li>{/if}
		<li><button type="button" onclick={() => copy(done)}><Icon name="copy" /> {t(copied ? 'menu.copied' : 'card.copy')}</button></li>
	{/snippet}
</CardMenu>
