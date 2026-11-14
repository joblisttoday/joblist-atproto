<script>
	import { page } from '$app/state';
	import config from '#lib/data/config.json';
	import JobItem from '#lib/components/JobItem.svelte';
	import { domainOf, loadProfile } from '#lib/profile.js';
	import { session } from '#lib/session.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * An organization's page (/{domain}), read from its own account: who it is, then its open
	 * jobs. The same for everyone; its own account also has what to do with it (edit it, post
	 * a job, show its jobs on its website), its offers no longer shown, and, until it has
	 * both, the steps to describe itself and post.
	 */
	const domain = $derived(domainOf(page.params.handle || ''));
	/** undefined while read; null: no organization; 'unreachable': its server did not answer */
	let profile = $state(/** @type {import('#lib/profile.js').Profile | null | 'unreachable' | undefined} */ (undefined));
	$effect(() => {
		const asked = domain;
		profile = undefined;
		if (!asked) return void (profile = null);
		loadProfile(asked).then(
			(p) => asked === domain && (profile = p),
			() => asked === domain && (profile = 'unreachable')
		);
	});
	const own = $derived(Boolean(domain) && session.handle === domain);
	const found = $derived(typeof profile === 'object' && profile ? profile : null);
	const open = $derived(found ? found.jobs.filter((j) => j.live) : []);
	const closed = $derived(found ? found.jobs.filter((j) => !j.live) : []);
</script>

<svelte:head><title>{found?.company?.name || domain || t('notFound.title')} · {config.name}</title></svelte:head>

{#if profile === undefined}
	<h1>{domain}</h1>
	<p><small>{t('profile.reading')}</small></p>
{:else if profile === 'unreachable'}
	<h1>{domain}</h1>
	<p role="alert">{t('profile.unreachable')}</p>
{:else if !found}
	<h1>{domain || t('notFound.title')}</h1>
	<p>{domain ? t('profile.none', { domain }) : t('notFound.text')}</p>
{:else}
	<header>
		{#if found.avatar}<img src={found.avatar} alt="" />{/if}
		<h1>{found.company?.name || domain}</h1>
	</header>
	<p>
		<small>
			{#if found.company?.url}<a href={found.company.url} target="_blank" rel="noopener">{domain}</a>{:else}{domain}{/if}
			{#if found.company?.kind}· {t(`kind.${found.company.kind}`)}{/if}
			{#if found.company?.tags.length}· {found.company.tags.join(', ')}{/if}
		</small>
	</p>
	{#if found.company?.description}<p data-text>{found.company.description}</p>{:else if !found.company}<p><small>{t('profile.notDescribed')}</small></p>{/if}
	{#if own}
		<menu>
			<a href="/{domain}/edit">{t('profile.edit')}</a>
			<a href="/{domain}/post" data-primary>{t('profile.post')}</a>
			<a href="/{domain}/embed">{t('profile.embed')}</a>
		</menu>
	{/if}

	<section aria-labelledby="profile-jobs">
		<h2 id="profile-jobs">{t('profile.jobs')}</h2>
		{#if open.length}
			<ul>{#each open as job (job.rkey)}<JobItem {job} did={found.did} />{/each}</ul>
		{:else}
			<p>{t('profile.jobs.none')}</p>
		{/if}
	</section>

	{#if own && closed.length}
		<section aria-labelledby="profile-closed">
			<h2 id="profile-closed">{t('profile.closed')}</h2>
			<ul>{#each closed as job (job.rkey)}<JobItem {job} did={found.did} />{/each}</ul>
		</section>
	{/if}

	{#if own && !(found.company && found.jobs.length)}
		<section aria-labelledby="profile-setup">
			<h2 id="profile-setup">{t('setup.title')}</h2>
			<ol>
				<li><a href="/{domain}/edit">{t('setup.describe')}</a>{#if found.company}<small> · {t('setup.done')}</small>{/if}</li>
				<li><a href="/{domain}/post">{t('setup.post')}</a>{#if found.jobs.length}<small> · {t('setup.done')}</small>{/if}</li>
				<li><a href="/{domain}/embed">{t('setup.embed')}</a></li>
			</ol>
		</section>
	{/if}
{/if}

<style>
	header {
		display: flex;
		align-items: center;
		gap: var(--space-m);
		margin-top: var(--space-l);
	}
	header h1 {
		margin: 0;
		overflow-wrap: anywhere;
	}
	header img {
		flex: none;
		width: var(--avatar-size);
		height: var(--avatar-size);
		border-radius: var(--radius);
		object-fit: cover;
	}
	header + p {
		margin-top: var(--space-xs);
	}
	[data-text] {
		white-space: pre-line;
	}
</style>
