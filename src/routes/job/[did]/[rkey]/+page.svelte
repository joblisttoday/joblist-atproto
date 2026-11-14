<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import config from '#lib/data/config.json';
	import { ago } from '#lib/i18n/dates.js';
	import { loadJob } from '#lib/profile.js';
	import { daysLeft } from '#lib/records.js';
	import { deleteRecord, session } from '#lib/session.svelte.js';
	import { i18n, t } from '#lib/i18n/index.svelte.js';

	/**
	 * A job offer's page (/job/{did}/{rkey}, the address its record keeps), read from its
	 * organization's own account: what, where, how to apply. Its own account also changes or
	 * deletes it.
	 */
	const did = $derived(page.params.did || '');
	const rkey = $derived(page.params.rkey || '');
	/** undefined while read; null: not there; 'unreachable' */
	let job = $state(/** @type {Awaited<ReturnType<typeof loadJob>> | 'unreachable' | undefined} */ (undefined));
	$effect(() => {
		const asked = `${did}/${rkey}`;
		job = undefined;
		loadJob(did, rkey).then(
			(j) => asked === `${did}/${rkey}` && (job = j),
			() => asked === `${did}/${rkey}` && (job = 'unreachable')
		);
	});
	const found = $derived(typeof job === 'object' && job ? job : null);
	const own = $derived(Boolean(found) && session.did === did);
	const facts = $derived(
		found ? [found.place, found.remote && t(`job.remote.${found.remote}`), found.employment && t(`job.employment.${found.employment}`)].filter(Boolean) : []
	);
	const when = $derived(
		found
			? [found.createdAt && t('job.posted', { ago: ago(Date.parse(found.createdAt), i18n.locale) }), found.live && t('job.left', { count: daysLeft(found.expiresAt) })].filter(Boolean)
			: []
	);

	async function remove() {
		if (!found || !confirm(t('job.delete.confirm'))) return;
		await deleteRecord(config.collections.job, rkey);
		await goto(`/${found.company}`);
	}
</script>

<svelte:head><title>{found?.title || t('notFound.title')} · {config.name}</title></svelte:head>

{#if job === undefined}
	<p><small>…</small></p>
{:else if job === 'unreachable'}
	<p role="alert">{t('profile.unreachable')}</p>
{:else if !found}
	<h1>{t('notFound.title')}</h1>
	<p>{t('job.notFound')}</p>
{:else}
	<p><a href="/{found.company}">{found.name}</a></p>
	<h1>{found.title}</h1>
	{#if facts.length}<p>{facts.join(' · ')}</p>{/if}
	<p><small>{when.join(' · ')}</small></p>
	{#if !found.live}<p role="status">{t('job.closed')}</p>{/if}
	<menu>
		{#if found.live && found.apply}<a href={found.apply} target="_blank" rel="noopener noreferrer" data-primary>{t('job.apply')}</a>{/if}
		{#if own}
			<a href="{page.url.pathname}/edit">{t('profile.edit')}</a>
			<button type="button" onclick={remove}>{t('job.delete')}</button>
		{/if}
	</menu>
	{#if found.description}<p data-text>{found.description}</p>{/if}
{/if}

<style>
	p:first-child {
		margin-top: var(--space-m);
	}
	menu {
		margin-bottom: var(--space-l);
	}
	[data-text] {
		white-space: pre-line;
	}
</style>
