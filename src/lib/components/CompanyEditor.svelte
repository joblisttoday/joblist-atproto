<script>
	import { ownPath } from '#lib/network/own-organization.svelte.js';
	import FormPage from '#lib/components/FormPage.svelte';
	import config from '#lib/data/config.json';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { tick } from 'svelte';
	import AddSaved from '#lib/components/AddSaved.svelte';
	import CompanyClaim from '#lib/components/CompanyClaim.svelte';
	import CompanyForm from '#lib/components/CompanyForm.svelte';
	import Pending from '#lib/components/Pending.svelte';
	import { hasInput, parsePaste, readExtras, readParams, toPrefill } from '#lib/models/paste.js';
	import { mayDescribe, ownDomain, toDomain } from '#lib/models/company.js';
	import { data } from '#lib/network/network.svelte.js';
	import { session } from '#lib/auth/session.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Describing an organization (/{domain}/edit with ?field=…, ?all or what a link gives): signed
	 * in with its domain as its handle, the form for that domain (new, or its own record to
	 * edit; ?field=… one part alone). Anyone else, or another domain (?url=… from an
	 * organization's page), is shown how. &name=…&board=…&description=…&link=… fill the form;
	 * ?next=/{domain}/post goes back to post a job.
	 */
	const params = $derived(page.url.searchParams);
	const own = $derived(ownDomain(session.handle));
	const pasted = $derived(parsePaste(readParams(params)));
	const target = $derived(params.get('key') || toDomain(pasted.url || '') || own);
	const company = $derived(target ? data.companies.get(target) || null : null);
	const open = $derived(Boolean(target) && mayDescribe({ key: target }, session));
	const back = $derived(params.get('next') || '');
	// One part of it to edit (from the dashboard): titled after that part.
	const field = $derived(company ? params.get('field') || '' : '');
	const fieldTitles = /** @type {Record<string, string>} */ ({ description: 'orgs.field.description', jobBoard: 'orgs.field.jobBoard', locations: 'orgs.field.locations', tags: 'orgs.field.tags', kind: 'form.kind', links: 'form.links' });
	const heading = $derived(fieldTitles[field] ? t(fieldTitles[field]) : company ? t('form.company.edit') : t('form.company.title'));
	const prefill = $derived({ ...toPrefill(hasInput(params) ? pasted : parsePaste({ link: `https://${target}`, name: '', board: '' })), ...readExtras(params) });

	/**
	 * Saved: what next.
	 * @typedef {{key: string, name: string, added: boolean}} Saved
	 * @type {Saved | null}
	 */
	let saved = $state(null);

	/** @param {Saved} done */
	async function onsaved(done) {
		if (back === ownPath('post')) return goto(`${back}?company=${encodeURIComponent(done.key)}`);
		// An edit goes back to its page on the dashboard; a first description says what comes next.
		if (!done.added) return goto(ownPath('edit'));
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
		<h1>{heading}</h1>
		{#if field && open}<p><small><a href="{ownPath('edit')}?all">{t('orgs.editAll')}</a></small></p>{/if}
		{#if open && params.get('key') && !company}
			<!-- Editing its record: the form waits for it, so it starts from what it says. -->
			<Pending />
		{:else if open}
			<!-- Made again once its record is read: the form starts from what it says. -->
			{#key `${company?.key || target}:${Boolean(company)}:${page.url.search}`}
				<CompanyForm {company} {prefill} focus={params.get('field') || ''} {onsaved} oncancel={() => history.back()} />
			{/key}
		{:else if target}
			<CompanyClaim company={company || { key: target, verified: false }} />
			<p><a href="/{target}">{company?.name || target}</a></p>
		{:else}
			<p>{t('add.ownOnly')}</p>
			<menu><a href="/signin?next={encodeURIComponent(page.url.pathname + page.url.search)}" data-primary>{t('nav.signin')}</a></menu>
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
