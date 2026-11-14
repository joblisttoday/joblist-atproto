<script>
	import { page } from '$app/state';
	import config from '#lib/data/config.json';
	import ContextMenu from '#lib/components/ContextMenu.svelte';
	import JobList from '#lib/components/JobList.svelte';
	import PlacesMap from '#lib/components/PlacesMap.svelte';
	import { locationPoints } from '#lib/places.js';
	import { share } from '#lib/share.js';
	import { domainOf, loadProfile } from '#lib/profile.js';
	import { session } from '#lib/session.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * An organization's page (/{domain}), read from its own account: who it is, then its open
	 * jobs. The same for everyone, with a "⋯" menu (share it); its own account's menu also
	 * edits it, posts a job, shows its jobs on its website; it also sees its offers no longer
	 * shown and, until it has both, the steps to describe itself and post.
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
	/** Its places on the map; and where its open jobs are done, each opening its job. */
	const points = $derived(
		found
			? [
					...locationPoints(found.company?.locations || []).map((p) => ({ ...p, label: `${found.company?.name || domain} · ${p.label}` })),
					...open.flatMap((j) => locationPoints(j.locations).map((p) => ({ ...p, label: j.title, href: `/job/${encodeURIComponent(found.did)}/${j.rkey}` })))
				]
			: []
	);
	let copied = $state(false);
	/** A job its own account deleted, gone from the page. @param {string} rkey */
	const forget = (rkey) => found && (found.jobs = found.jobs.filter((j) => j.rkey !== rkey));
	const actions = $derived([
		...(own
			? [
					{ label: t('profile.post'), icon: /** @type {const} */ ('post'), href: `/${domain}/post` },
					{ label: t('profile.edit'), icon: /** @type {const} */ ('edit'), href: `/${domain}/edit` },
					{ label: t('profile.embed'), icon: /** @type {const} */ ('source'), href: `/${domain}/embed` }
				]
			: []),
		{ label: t('menu.share'), icon: /** @type {const} */ ('share'), onclick: async () => (copied = (await share({ title: found?.company?.name || domain, url: location.href })) === 'copied') }
	]);
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
	<jl-wide>
		<div>
			<header>
				{#if found.avatar}<img src={found.avatar} alt="" />{/if}
				<h1>{found.company?.name || domain}</h1>
				<ContextMenu label={t('menu.more')} items={actions} />
			</header>
			{#if copied}<p role="status"><small>{t('menu.copied')}</small></p>{/if}
			<p>
				<small>
					{#if found.company?.url}<a href={found.company.url} target="_blank" rel="noopener">{domain}</a>{:else}{domain}{/if}
					{#if found.company?.kind}· {t(`kind.${found.company.kind}`)}{/if}
					{#if found.company?.tags.length}· {found.company.tags.join(', ')}{/if}
				</small>
			</p>
			{#if found.company?.description}<p data-text>{found.company.description}</p>{:else if !found.company}<p><small>{t('profile.notDescribed')}</small></p>{/if}
			{#if found.company?.links.length}
				<p data-links>{#each found.company.links as link (link)}<a href={link} target="_blank" rel="noopener">{link.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}</a>{/each}</p>
			{/if}

			<section aria-labelledby="profile-jobs">
				<h2 id="profile-jobs">{t('profile.jobs')}</h2>
				{#if open.length}
					<JobList jobs={open} did={found.did} {own} ondeleted={forget} />
				{:else}
					<p>{t('profile.jobs.none')}</p>
				{/if}
			</section>

			{#if own && closed.length}
				<section aria-labelledby="profile-closed">
					<h2 id="profile-closed">{t('profile.closed')}</h2>
					<JobList jobs={closed} did={found.did} {own} ondeleted={forget} />
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
		</div>
		<aside><PlacesMap {points} /></aside>
	</jl-wide>
{/if}

<style>
	header {
		display: flex;
		align-items: center;
		gap: var(--space-m);
		margin-top: var(--space-l);
	}
	header h1 {
		flex: 1;
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
	[data-links] {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-xs) var(--space-m);
		font-size: var(--font-size-small);
	}
	[data-text] {
		white-space: pre-line;
	}
</style>
