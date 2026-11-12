<script>
	import JobCard from '../../src/lib/components/JobCard.svelte';
	import { filterJobs, sameOffers } from '../../src/lib/models/job.js';
	import { jobFacts } from '../../src/lib/models/job-card.js';
	import { boardOf, find, findOrganization } from './find.js';
	import { i18n, t } from './i18n.svelte.js';

	/**
	 * <joblist-jobs board="greenhouse:acme" query="legal" where="Berlin" remote="remote" search lang="en" limit="20">
	 * An organization's open jobs on any website, as joblist shows them: the same cards
	 * (JobCard), search (filterJobs) and offers (sameOffers), read live from its own board
	 * (find.js). board: provider:id or its address. Its look follows the page's colors; set
	 * --joblist-font, --joblist-fg, --joblist-muted, --joblist-line, --joblist-soft and
	 * --joblist-accent on it to change them.
	 */
	/** @type {{board?: string, organization?: string, lang?: string, limit?: number | string, query?: string, where?: string, remote?: string, search?: boolean}} */
	let { board = '', organization = '', lang = '', limit = 0, query = '', where = '', remote = '', search = false } = $props();
	const settings = __EMBED__;
	const id = `jl-${Math.random().toString(36).slice(2, 8)}`;

	// Its language: lang="…", else the page's, else the browser's; one it does not know, English.
	$effect(() => {
		const asked = (lang || document.documentElement.lang || navigator.language || 'en').slice(0, 2).toLowerCase();
		i18n.locale = asked in settings.strings ? asked : 'en';
	});

	const asked = $derived(boardOf(board || ''));
	/** undefined while read, null when nothing could be */
	let found = $state(/** @type {import('./find.js').Found | undefined} */ (undefined));
	// organization="acme.org": its own account says its name and its jobs (find.js).
	$effect(() => {
		const now = asked;
		const domain = organization;
		found = undefined;
		(domain && !now ? findOrganization(domain) : find(now)).then((answer) => now === asked && domain === organization && (found = answer));
	});

	let typed = $state('');
	const names = $derived(new Map(found ? [[found.jobs[0]?.company || '', found.name]] : []));
	// The site's own search and offers: what someone finds here, they find on joblist.
	const offers = $derived(
		found ? sameOffers(filterJobs(found.jobs, { query: `${query || ''} ${typed}`.trim(), where: where || '', remote: remote === 'remote' ? 'remote' : '' }, names)) : []
	);
	const shown = $derived(offers.slice(0, Math.max(1, Number(limit) || settings.shown)));
	const count = $derived(t('embed.count', { count: offers.length }));
	// All of them, on joblist: the page of its board.
	const whole = $derived(
		organization && !asked ? `${settings.site}/${organization}` : asked ? `${settings.site}/me/organization#${new URLSearchParams({ url: board || '' })}` : settings.site
	);
</script>

<jl-embed>
	{#if found === null}
		<p>{t('embed.error')}</p>
	{:else}
		<h2><a href={whole} target="_blank" rel="noopener">{t('embed.title', { name: found?.name || asked?.id || organization || '' })}</a></h2>
		{#if search}
			<label for="{id}-search">{t('embed.search')}</label>
			<input id="{id}-search" type="search" bind:value={typed} placeholder={t('embed.search')} />
		{/if}
		{#if found}
			<p>{count}</p>
			{#if shown.length}
				<ul>
					{#each shown as job (job.url)}
						<li>
							<a href={job.url} target="_blank" rel="noopener">
								<JobCard title={job.title} facts={jobFacts(job, { t, locale: i18n.locale })} />
							</a>
						</li>
					{/each}
				</ul>
			{:else}
				<p>{t('embed.none')}</p>
			{/if}
			<footer>
				{#if offers.length > shown.length}<a href={whole} target="_blank" rel="noopener">{t('embed.more', { count })}</a> ·{/if}
				<a href={settings.site} target="_blank" rel="noopener">{t('embed.by')}</a>
			</footer>
		{/if}
	{/if}
</jl-embed>

<style>
	/* joblist's tokens (src/app.css), here on any page: its colors from the page's, unless set. */
	jl-embed {
		--space-xxs: 0.125rem;
		--space-xs: 0.25rem;
		--space-s: 0.5rem;
		--space-m: 1rem;
		--radius: 0.5rem;
		--radius-round: 999px;
		--font-size-small: 0.875rem;
		--font-weight-strong: 600;
		--chip-line: 1.6;
		--color-fg: var(--joblist-fg, currentColor);
		--color-muted: var(--joblist-muted, rgb(128 128 128));
		--color-soft: var(--joblist-soft, rgb(128 128 128 / 0.14));
		--color-line: var(--joblist-line, rgb(128 128 128 / 0.3));
		--color-warn: var(--joblist-warn, #8a5a00);
		--color-accent: var(--joblist-accent, currentColor);
		display: block;
		font-family: var(--joblist-font, inherit);
		color: var(--color-fg);
		line-height: 1.45;
	}
	h2 {
		margin: 0 0 var(--space-s);
		font-size: 1.15em;
	}
	a {
		color: inherit;
	}
	h2 a {
		text-decoration: none;
	}
	h2 a:hover {
		text-decoration: underline;
	}
	label {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
	}
	input {
		box-sizing: border-box;
		width: 100%;
		margin: 0 0 var(--space-s);
		padding: var(--space-s) var(--space-m);
		font: inherit;
		color: inherit;
		background: transparent;
		border: 1px solid var(--color-line);
		border-radius: var(--radius);
	}
	p,
	footer {
		margin: 0;
		color: var(--color-muted);
		font-size: var(--font-size-small);
	}
	footer {
		margin-top: var(--space-s);
	}
	footer a {
		color: var(--color-accent);
	}
	ul {
		margin: var(--space-xs) 0 0;
		padding: 0;
		list-style: none;
	}
	/* The site's job cards: a line between them, the title underlined on hover. */
	li {
		border-bottom: 1px solid var(--color-line);
	}
	li a {
		display: block;
		padding: var(--space-s) 0;
		text-decoration: none;
	}
	li a:hover :global(strong) {
		text-decoration: underline;
	}
</style>
