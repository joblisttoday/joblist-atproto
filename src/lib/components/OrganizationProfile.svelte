<script>
	import Icon from './Icon.svelte';
	import Jobs from './Jobs.svelte';
	import PageHeader from './PageHeader.svelte';
	import providers from '#lib/data/providers.json';
	import { placeCounts } from '#lib/models/job.js';
	import { prettyId } from '#lib/models/paste.js';
	import { discover } from '#lib/network/discover.js';
	import { forget, keep, kept } from '#lib/network/kept.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * An organization joblist does not know yet, as a browser finds it from its link
	 * (network/discover.js): its Bluesky account, its job board and its open jobs (read
	 * live, one board), where those jobs are. Kept or not (in this browser), and suggested
	 * to joblist with all that was found (the add form, filled in).
	 * @type {{link: string}}
	 */
	let { link } = $props();
	let found = $state(/** @type {import('#lib/network/discover.js').Found | null} */ (null));
	$effect(() => {
		const asked = link;
		found = null;
		discover(asked).then((f) => asked === link && (found = f));
	});
	/** @type {import('#lib/ats/job.js').Job[]} */
	let jobs = $state.raw([]);
	let busy = $state(false);

	const item = $derived(kept.list.find((k) => k.url === link));
	const host = $derived(new URL(link).hostname.replace(/^www\./, ''));
	const short = $derived(`${host}${new URL(link).pathname.replace(/\/$/, '')}`);
	// Its own name first, then what was found; a board's id as a name, else its link.
	const guessed = $derived(found?.board ? prettyId(found.board.id) : '');
	const name = $derived(item?.name || found?.bluesky?.name || found?.boardName || guessed || found?.key || short);
	const board = $derived(found?.board || null);
	const boardHref = $derived(board ? providers.find((p) => p.id === board.provider)?.board.replace('{id}', board.id) || link : '');
	const provider = $derived(board ? providers.find((p) => p.id === board.provider)?.name || board.provider : '');
	const website = $derived(found?.key ? `https://${found.key}` : '');
	const bluesky = $derived(found?.bluesky ? `https://bsky.app/profile/${found.bluesky.handle}` : '');
	const places = $derived(placeCounts(jobs, 5));
	// Its jobs, read from its board (live, one board): never every job of the snapshot.
	const company = $derived(
		board
			? /** @type {import('#lib/models/company.js').Company} */ (
					/** @type {unknown} */ ({ key: found?.key || `${board.provider}-${board.id}`, name, jobBoard: board, tags: [], locations: [], links: [] })
				)
			: null
	);
	const noSnapshot = () => Promise.resolve(null);

	/** The add form, filled in with what was found. */
	const suggest = $derived.by(() => {
		const params = new URLSearchParams();
		const url = website || link;
		params.set('url', url);
		params.set('name', name === short ? '' : name);
		if (boardHref) params.set('board', boardHref);
		if (found?.bluesky?.description) params.set('description', found.bluesky.description);
		// Its other links: its Bluesky profile, and the kept link when it is not its website or board.
		for (const other of new Set([bluesky, link])) if (other && other !== url && other !== boardHref) params.append('link', other);
		return `/add?${params}`;
	});
</script>

<jl-organization-profile>
	<PageHeader title={name} intro={t('org.intro')} />
	{#if found?.bluesky?.avatar}<img src={found.bluesky.avatar} alt="" />{/if}

	<dl>
		<dt>{t('org.link')}</dt>
		<dd><a href={link} target="_blank" rel="noopener noreferrer">{short} <Icon name="external" /></a></dd>
		{#if website && website !== link}
			<dt>{t('form.website')}</dt>
			<dd><a href={website} target="_blank" rel="noopener noreferrer">{found?.key} <Icon name="external" /></a></dd>
		{/if}
		<dt>{t('company.jobBoard')}</dt>
		<dd>
			{#if board}<a href={boardHref} target="_blank" rel="noopener noreferrer">{provider} · {board.id} <Icon name="external" /></a>
			{:else if found}<small>{t('org.noBoard')}</small>
			{:else}<small>{t('org.looking')}</small>{/if}
		</dd>
		<dt>Bluesky</dt>
		<dd>
			{#if found?.bluesky}
				<a href={bluesky} target="_blank" rel="noopener noreferrer">@{found.bluesky.handle} <Icon name="external" /></a>
				{#if found.bluesky.followers}<small>· {t('company.followers', { count: found.bluesky.followers })}</small>{/if}
			{:else if found}<small>{found.key ? t('org.noBluesky') : t('org.none')}</small>
			{:else}<small>{t('org.looking')}</small>{/if}
		</dd>
		{#if places.length}
			<dt>{t('org.places')}</dt>
			<dd>{places.map(([place]) => place).join(' · ')}</dd>
		{/if}
	</dl>
	{#if found?.bluesky?.description}<p data-about>{found.bluesky.description}</p>{/if}

	<menu>
		<a href={suggest} data-primary><Icon name="add" /> {t('org.suggest')}</a>
		{#if item}
			<button type="button" onclick={() => forget(link)}><Icon name="savedOn" /> {t('collections.saved')}</button>
		{:else}
			<button type="button" onclick={() => keep(link, name === short ? '' : name)}><Icon name="save" /> {t('collections.save')}</button>
		{/if}
	</menu>
	<p><small>{t('org.how')}</small></p>

	<section aria-labelledby="org-jobs">
		<h2 id="org-jobs">{t('list.tab.jobs')}</h2>
		{#if company}
			<Jobs companies={[company]} search={false} source={noSnapshot} bind:jobs bind:busy />
		{:else if found}
			<p>{t('org.jobsThere')} <a href={link} target="_blank" rel="noopener noreferrer">{short} <Icon name="external" /></a></p>
		{/if}
	</section>
</jl-organization-profile>

<style>
	jl-organization-profile {
		display: block;
		padding-bottom: var(--space-xl);
	}
	dl {
		display: grid;
		grid-template-columns: max-content minmax(0, 1fr);
		gap: var(--space-xs) var(--space-m);
		margin: var(--space-m) 0;
	}
	dt {
		color: var(--color-muted);
		font-size: var(--font-size-small);
	}
	dd {
		margin: 0;
		overflow-wrap: anywhere;
	}
	img {
		width: var(--avatar-small);
		height: var(--avatar-small);
		border-radius: var(--radius);
		object-fit: cover;
	}
	small {
		color: var(--color-muted);
	}
	[data-about] {
		white-space: pre-line;
	}
	menu {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-s);
		margin: var(--space-m) 0 var(--space-xs);
		padding: 0;
	}
	[data-primary] {
		background: var(--color-accent);
		color: var(--color-accent-fg);
		border-color: var(--color-accent);
	}
	section {
		margin-top: var(--space-l);
	}
</style>
