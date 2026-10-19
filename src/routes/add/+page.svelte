<script>
	import config from '#lib/data/config.json';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import CompanyForm from '#lib/components/CompanyForm.svelte';
	import RequireSession from '#lib/components/RequireSession.svelte';
	import { data } from '#lib/network/network.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	const key = $derived(page.url.searchParams.get('key'));
	const company = $derived(key ? data.companies.get(key) || null : null);
	const url = $derived(page.url.searchParams.get('url') || '');
	// Described from "suggest a company" on a list (?list=/handle/rkey): go back there with it.
	const list = $derived(page.url.searchParams.get('list') || '');
	/** @param {string} key */
	const next = (key) => (/^\/[\w.:-]+\/[\w.:~-]+$/.test(list) ? `${list}?suggest=${encodeURIComponent(key)}` : `/company/${key}`);
</script>

<svelte:head><title>{company ? t('form.company.edit') : t('form.company.title')} · {config.name}</title></svelte:head>

<h1>{company ? t('form.company.edit') : t('form.company.title')}</h1>
<RequireSession>
	{#key company?.key ?? url}
		<CompanyForm
			{company}
			initialUrl={url}
			onsaved={(saved) => goto(next(saved))}
			oncancel={() => history.back()}
		/>
	{/key}
</RequireSession>
