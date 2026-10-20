<script>
	import config from '#lib/data/config.json';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import AddAnywhere from '#lib/components/AddAnywhere.svelte';
	import AddFound from '#lib/components/AddFound.svelte';
	import AddLink from '#lib/components/AddLink.svelte';
	import CompanyForm from '#lib/components/CompanyForm.svelte';
	import RequireSession from '#lib/components/RequireSession.svelte';
	import { checkBoard } from '#lib/ats/board-check.js';
	import { findCompany, hasInput, parsePaste, readParams, toPrefill } from '#lib/models/paste.js';
	import { data } from '#lib/network/network.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	// /add?key=… edits a company; /add?url=…&name=…&board=… (links, bookmarklet)
	// and /add?title=…&text=…&url=… (share target) start from a pasted link.
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
	/** @param {string} key */
	const next = (key) => {
		if (/^\/[\w.:-]+\/[\w.:~-]+$/.test(list)) return `${list}?suggest=${encodeURIComponent(key)}`;
		if (back === '/jobs/new') return `${back}?company=${encodeURIComponent(key)}`;
		return `/company/${key}`;
	};
</script>

<svelte:head><title>{title} · {config.name}</title></svelte:head>

<h1>{title}</h1>

{#if !key}
	<AddLink value={input.link || input.name} {list} next={back} />
{/if}

{#if started}
	{#await check}
		<p aria-live="polite"><small>{t('add.checking')}</small></p>
	{:then found}
		{#if !key}<AddFound {board} count={found?.count} existing={company} />{/if}
		<RequireSession>
			{#key `${company?.key}:${page.url.search}`}
				<CompanyForm
					{company}
					prefill={toPrefill(pasted, found?.name)}
					onsaved={(saved) => goto(next(saved))}
					oncancel={() => history.back()}
				/>
			{/key}
		</RequireSession>
	{/await}
{:else}
	<p><small><a href="/add?name=">{t('add.manual')}</a></small></p>
	<section aria-labelledby="add-more">
		<h2 id="add-more">{t('add.more')}</h2>
		<menu>
			<a href="/lists/new">+ {t('list.new')}</a>
			<a href="/jobs/new">+ {t('post.title')}</a>
		</menu>
	</section>
	<AddAnywhere />
{/if}
