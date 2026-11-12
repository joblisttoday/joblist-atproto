<script>
	import config from '#lib/data/config.json';
	import Embed from '#lib/components/Embed.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import NotFound from '#lib/components/NotFound.svelte';
	import Pending from '#lib/components/Pending.svelte';
	import { page } from '$app/state';
	import { ATPROTO } from '#lib/models/company.js';
	import { isDomain } from '#lib/models/kept.js';
	import { data, lookup } from '#lib/network/network.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * An organization's jobs on a website (/{domain}/embed, from its page's "…"): its board's,
	 * or its own account's (posting on joblist), one line to paste. Its account opens it from its
	 * dashboard too; anyone may show its open jobs on their own site.
	 */
	const handle = $derived(page.params.handle || '');
	const company = $derived(data.companies.get(handle));
	let looked = $state(false);
	$effect(() => {
		const asked = handle;
		looked = false;
		if (!isDomain(asked)) return void (looked = true);
		lookup(asked).finally(() => asked === handle && (looked = true));
	});
	const board = $derived(company?.jobBoard?.provider && company.jobBoard.provider !== ATPROTO && company.jobBoard.id ? company.jobBoard : null);
	const posts = $derived(Boolean(company) && (company?.jobBoard?.provider === ATPROTO || data.postedJobs.has(handle)));
	const name = $derived(company?.name || handle);
</script>

<svelte:head><title>{t('embed.section')} · {name} · {config.name}</title></svelte:head>

<jl-org-embed>
	{#if company}
		<p><a href="/{company.key}"><Icon name="back" /> {name}</a></p>
		<h1>{t('embed.section')}</h1>
		{#if board}
			<Embed attribute="board" value="{board.provider}:{board.id}" title={t('embed.title', { name })} />
		{:else if posts}
			<Embed attribute="organization" value={company.key} title={t('embed.title', { name })} />
		{:else}
			<p>{t('embed.nothing')}</p>
		{/if}
	{:else if !looked}
		<Pending />
	{:else}
		<NotFound title={t('notFound.title')} text={t('notFound.path', { path: page.url.pathname })} />
	{/if}
</jl-org-embed>

<style>
	jl-org-embed {
		display: block;
		max-width: var(--reading-width);
		margin-inline: auto;
		padding-bottom: var(--space-xl);
	}
	p:first-child a {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xxs);
		min-height: var(--tap-size);
		color: var(--color-muted);
		text-decoration: none;
	}
</style>
