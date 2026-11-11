<script>
	import Icon from './Icon.svelte';
	import config from '#lib/data/config.json';
	import providers from '#lib/data/providers.json';
	import { keptUrl, keyOf, knownBy } from '#lib/models/kept.js';
	import { prettyId } from '#lib/models/paste.js';
	import { suggestAddress } from '#lib/models/suggest.js';
	import { discover } from '#lib/network/discover.js';
	import { forget, isKeptLink, keep, kept } from '#lib/network/kept.svelte.js';
	import { jobCounts } from '#lib/network/job-counts.svelte.js';
	import { data } from '#lib/network/network.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Collect an organization: a link (its website, its job board, a social profile), a domain,
	 * or a name. joblist says what it finds (whether it knows it and its open jobs, its board, its
	 * Bluesky account), to save in this browser, open, or suggest to joblist for everyone. A
	 * website's own page is not readable from here (websites do not answer other sites): the
	 * add-on reads it, on the site.
	 */
	const id = $props.id();
	let text = $state('');
	/** What was asked: a link, or a name. */
	let asked = $state({ link: '', name: '' });
	let found = $state(/** @type {import('#lib/network/discover.js').Found | null} */ (null));
	let looking = $state(false);
	let error = $state('');

	const known = $derived(asked.link ? knownBy(data.companies)(asked.link) : undefined);
	const counts = $derived(jobCounts());
	// By its name: organizations joblist knows whose name says it.
	const named = $derived.by(() => {
		const words = asked.name.toLowerCase().split(/\s+/).filter(Boolean);
		if (!words.length) return [];
		return [...data.companies.values()].filter((c) => words.every((w) => c.name.toLowerCase().includes(w))).slice(0, config.kept.namesShown);
	});

	/** @param {SubmitEvent} event */
	async function collect(event) {
		event.preventDefault();
		error = '';
		const value = text.trim();
		if (!value) return;
		const link = keptUrl(value);
		// A name (no dot, or spaces): those joblist knows by it.
		if (!link || /\s/.test(value)) {
			asked = { link: '', name: value };
			found = null;
			return;
		}
		asked = { link, name: '' };
		found = null;
		looking = true;
		const answer = await discover(link);
		if (asked.link === link) {
			found = answer;
			looking = false;
		}
	}

	// Its board: the link's own, else the one joblist knows it by.
	const board = $derived(
		found?.board || (known?.jobBoard?.provider && known.jobBoard.id ? { provider: known.jobBoard.provider, id: known.jobBoard.id } : null)
	);
	const boardHref = $derived(board ? providers.find((p) => p.id === board.provider)?.board.replace('{id}', board.id) || asked.link : '');
	const short = $derived(asked.link.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''));
	const name = $derived(known?.name || found?.bluesky?.name || found?.boardName || (board ? prettyId(board.id) : '') || found?.key || short);
	const website = $derived(found?.key ? `https://${found.key}` : '');
	const bluesky = $derived(found?.bluesky ? `https://bsky.app/profile/${found.bluesky.handle}` : '');
	// A website (not a board, not a platform's page): only the add-on reads it.
	const site = $derived(Boolean(found?.key) && !board && !known);
	const saved = $derived(asked.link ? isKeptLink(asked.link) || kept.list.some((k) => known && keyOf(k.url) === known.key) : false);
	const page = $derived(known ? `/company/${known.key}` : `/me/organization#${new URLSearchParams({ url: asked.link })}`);
	const suggest = $derived(
		suggestAddress({ link: asked.link, website, name: name === short ? '' : name, board: boardHref, description: found?.bluesky?.description, others: bluesky ? [bluesky] : [] })
	);

	function save() {
		if (saved) {
			const link = known ? kept.list.find((k) => keyOf(k.url) === known.key)?.url || asked.link : asked.link;
			forget(link);
		} else if (!keep(known ? `https://${known.key}` : asked.link, name === short ? '' : name)) error = t('kept.full', { max: config.kept.max });
	}
</script>

<jl-collect>
	<form onsubmit={collect}>
		<label for="{id}-what">{t('collect.label')}</label>
		<jl-collect-row>
			<input id="{id}-what" type="text" inputmode="url" autocapitalize="none" spellcheck="false" bind:value={text} placeholder={t('collect.example')} />
			<button type="submit"><Icon name="search" /> {t('collect.find')}</button>
		</jl-collect-row>
	</form>

	{#if asked.name}
		{#if named.length}
			<ul>
				{#each named as company (company.key)}
					<li><a href="/company/{company.key}">{company.name}</a> <small>{counts.get(company.key) ? t('kept.jobs', { count: counts.get(company.key) || 0 }) : t('kept.noJobs')}</small></li>
				{/each}
			</ul>
		{:else}
			<p><small>{t('collect.noName')}</small></p>
		{/if}
	{:else if asked.link}
		<jl-collect-found aria-live="polite" aria-busy={looking || undefined}>
			<strong>{looking && !known ? short : name}</strong>
			<dl>
				<dt>joblist</dt>
				<dd>{known ? `${t('extension.in')} · ${counts.get(known.key) ? t('kept.jobs', { count: counts.get(known.key) || 0 }) : t('kept.noJobs')}` : t('extension.out')}</dd>
				<dt>{t('company.jobBoard')}</dt>
				<dd>
					{#if boardHref}<a href={boardHref} target="_blank" rel="noopener noreferrer">{providers.find((p) => p.id === board?.provider)?.name} · {board?.id}</a>
					{:else if looking}<small>{t('org.looking')}</small>
					{:else}<small>{t('org.noBoard')}</small>{/if}
				</dd>
				<dt>Bluesky</dt>
				<dd>
					{#if bluesky}<a href={bluesky} target="_blank" rel="noopener noreferrer">@{found?.bluesky?.handle}</a>
					{:else if looking}<small>{t('org.looking')}</small>
					{:else}<small>{t('org.none')}</small>{/if}
				</dd>
			</dl>
			{#if site && !looking}<p><small>{t('collect.addon')} <a href="/apps">{t('collect.addonLink')}</a></small></p>{/if}
			<menu>
				<button type="button" aria-pressed={saved ? 'true' : 'false'} onclick={save}><Icon name={saved ? 'savedOn' : 'save'} /> {t(saved ? 'collections.saved' : 'collections.save')}</button>
				<a href={page}>{t('collect.open')}</a>
				{#if !known}<a href={suggest}><Icon name="add" /> {t('org.suggest')}</a>{/if}
			</menu>
			{#if error}<p role="alert">{error}</p>{/if}
		</jl-collect-found>
	{/if}
</jl-collect>

<style>
	jl-collect {
		display: block;
	}
	form {
		display: grid;
		gap: var(--space-xs);
	}
	label {
		font-size: var(--font-size-small);
		color: var(--color-muted);
	}
	jl-collect-row {
		display: flex;
		gap: var(--space-s);
	}
	input {
		flex: 1;
		min-width: 0;
	}
	button[type='submit'] {
		flex: none;
	}
	ul {
		margin: var(--space-s) 0 0;
		padding: 0;
		list-style: none;
	}
	li {
		padding: var(--space-xs) 0;
	}
	jl-collect-found {
		display: block;
		margin-top: var(--space-s);
		padding: var(--space-m);
		border: var(--border);
		border-radius: var(--radius);
	}
	dl {
		display: grid;
		grid-template-columns: max-content minmax(0, 1fr);
		gap: var(--space-xxs) var(--space-m);
		margin: var(--space-s) 0;
	}
	dt {
		color: var(--color-muted);
		font-size: var(--font-size-small);
	}
	dd {
		margin: 0;
		overflow-wrap: anywhere;
	}
	small {
		color: var(--color-muted);
	}
	menu {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-s);
		margin: var(--space-s) 0 0;
		padding: 0;
	}
	menu > * {
		font-size: var(--font-size-small);
	}
	button[aria-pressed='true'] {
		background: var(--color-soft);
		color: var(--color-ok);
	}
	[role='alert'] {
		color: var(--color-error);
	}
</style>
