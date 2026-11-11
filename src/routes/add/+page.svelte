<script>
	import FormPage from '#lib/components/FormPage.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import config from '#lib/data/config.json';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { tick } from 'svelte';
	import AddAnywhere from '#lib/components/AddAnywhere.svelte';
	import AddFound from '#lib/components/AddFound.svelte';
	import AddLink from '#lib/components/AddLink.svelte';
	import AddMine from '#lib/components/AddMine.svelte';
	import AddSaved from '#lib/components/AddSaved.svelte';
	import CompanyForm from '#lib/components/CompanyForm.svelte';
	import { checkBoard } from '#lib/ats/board-check.js';
	import { findCompany, hasInput, parsePaste, readExtras, readParams, toPrefill } from '#lib/models/paste.js';
	import { data } from '#lib/network/network.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	// /add?key=… edits a company (&field=… starts on one part); /add?url=…&name=…&board=…
	// (links, bookmarklet) and /add?title=…&text=…&url=… (share target) start from a pasted link;
	// &description=…&link=… (a kept organization's profile) fill more of it.
	const params = $derived(page.url.searchParams);
	const key = $derived(params.get('key'));
	const input = $derived(readParams(params));
	const started = $derived(Boolean(key) || hasInput(params));
	const pasted = $derived(parsePaste(input));
	const company = $derived(
		key ? data.companies.get(key) || null : started ? findCompany(data.companies, pasted) : null
	);
	const board = $derived(key ? null : pasted.board);
	const check = $derived(board ? checkBoard(board) : Promise.resolve(null));
	const title = $derived(company ? t('form.company.edit') : t('form.company.title'));
	// Described from "suggest a company" on a list (?list=/handle/rkey): go back there with it.
	const list = $derived(params.get('list') || '');
	// Described from "post a job" (?next=/jobs/new): go back there with it.
	const back = $derived(params.get('next') || '');
	/**
	 * Saved here (not sent back to a list or a job): what next.
	 * @typedef {{key: string, name: string, outcome: 'own' | 'shown' | 'behindOwn', added: boolean}} Saved
	 * @type {Saved | null}
	 */
	let saved = $state(null);

	/** @param {Saved} done */
	async function onsaved(done) {
		const { key } = done;
		if (/^\/[\w.:-]+\/[\w.:~-]+$/.test(list)) return goto(`${list}?suggest=${encodeURIComponent(key)}`);
		if (back === '/jobs/new') return goto(`${back}?company=${encodeURIComponent(key)}`);
		saved = done;
		await tick();
		scrollTo({ top: 0 });
		const heading = document.querySelector('jl-add-saved h1');
		if (heading instanceof HTMLElement) heading.focus();
	}
	// Another paste or link: the form again.
	$effect(() => {
		void page.url.search;
		saved = null;
	});
</script>

<svelte:head><title>{saved ? t('added.title') : title} · {config.name}</title></svelte:head>

<FormPage>
	{#if saved}
		<AddSaved {...saved} />
	{:else}
		<h1>{title}</h1>

		{#if !started}<AddMine />{/if}
		{#if !key}
			<AddLink value={input.link || input.name} {list} next={back} />
		{/if}

		{#if started}
			{#await check}
				<p aria-live="polite"><small>{t('add.checking')}</small></p>
			{:then found}
				{#if !key}<AddFound {board} count={found?.count} existing={company} />{/if}
				{#key `${company?.key}:${page.url.search}`}
					<CompanyForm
						{company}
						prefill={{ ...toPrefill(pasted, found?.name), ...readExtras(params) }}
						focus={params.get('field') || ''}
						{onsaved}
						oncancel={() => history.back()}
					/>
				{/key}
			{/await}
		{:else}
			<p><small><a href="/add?name=">{t('add.manual')}</a></small></p>
			<section aria-labelledby="add-more">
				<h2 id="add-more">{t('add.more')}</h2>
				<menu>
					<a href="/jobs/new" data-add><Icon name="add" /> {t('post.title')}</a>
				</menu>
			</section>
			<AddAnywhere />
		{/if}
	{/if}
</FormPage>
