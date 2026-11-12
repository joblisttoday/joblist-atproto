<script>
	import FormPage from '#lib/components/FormPage.svelte';
	import config from '#lib/data/config.json';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { tick } from 'svelte';
	import AddSaved from '#lib/components/AddSaved.svelte';
	import CompanyClaim from '#lib/components/CompanyClaim.svelte';
	import CompanyForm from '#lib/components/CompanyForm.svelte';
	import { hasInput, parsePaste, readExtras, readParams, toPrefill } from '#lib/models/paste.js';
	import { mayDescribe, ownDomain, toDomain } from '#lib/models/company.js';
	import { data } from '#lib/network/network.svelte.js';
	import { session } from '#lib/auth/session.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * An organization describes itself here, signed in with its domain as its handle: the form
	 * for that domain (new, or its own record to edit; &field=… starts on one part). Anyone
	 * else, or another domain (/add?url=… from an organization's page), is shown how.
	 * &name=…&board=…&description=…&link=… fill the form; ?next=/jobs/new goes back to post a job.
	 */
	const params = $derived(page.url.searchParams);
	const own = $derived(ownDomain(session.handle));
	const pasted = $derived(parsePaste(readParams(params)));
	const target = $derived(params.get('key') || toDomain(pasted.url || '') || own);
	const company = $derived(target ? data.companies.get(target) || null : null);
	const open = $derived(Boolean(target) && mayDescribe({ key: target }, session));
	const back = $derived(params.get('next') || '');
	const prefill = $derived({ ...toPrefill(hasInput(params) ? pasted : parsePaste({ link: `https://${target}`, name: '', board: '' })), ...readExtras(params) });

	/**
	 * Saved: what next.
	 * @typedef {{key: string, name: string, added: boolean}} Saved
	 * @type {Saved | null}
	 */
	let saved = $state(null);

	/** @param {Saved} done */
	async function onsaved(done) {
		if (back === '/jobs/new') return goto(`${back}?company=${encodeURIComponent(done.key)}`);
		saved = done;
		await tick();
		scrollTo({ top: 0 });
		const heading = document.querySelector('jl-add-saved h1');
		if (heading instanceof HTMLElement) heading.focus();
	}
</script>

<svelte:head><title>{saved ? t('added.title') : t('form.company.title')} · {config.name}</title></svelte:head>

<FormPage>
	{#if saved}
		<AddSaved {...saved} />
	{:else}
		<h1>{company ? t('form.company.edit') : t('form.company.title')}</h1>
		{#if open}
			{#key `${target}:${page.url.search}`}
				<CompanyForm {company} {prefill} focus={params.get('field') || ''} {onsaved} oncancel={() => history.back()} />
			{/key}
		{:else if target}
			<CompanyClaim company={company || { key: target, verified: false }} />
			<p><a href="/{target}">{company?.name || target}</a></p>
		{:else}
			<p>{t('add.ownOnly')}</p>
			<menu><a href="/signin?next=/add" data-primary>{t('nav.signin')}</a></menu>
		{/if}
	{/if}
</FormPage>

<style>
	[data-primary] {
		background: var(--color-accent);
		color: var(--color-accent-fg);
		border-color: var(--color-accent);
	}
</style>
