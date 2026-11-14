<script>
	import { jobPath } from '../../src/lib/records.js';
	import { loadProfile } from '../../src/lib/profile.js';
	import { i18n, t } from './i18n.svelte.js';

	/**
	 * <joblist-jobs organization="acme.org" lang="en" limit="20">: an organization's open jobs
	 * on any website, read live from its own atproto account, each linking to its page on
	 * joblist. Its look follows the page's colors; set --joblist-font, --joblist-fg,
	 * --joblist-muted and --joblist-line on it to change them.
	 */
	/** @type {{organization?: string, lang?: string, limit?: number | string}} */
	let { organization = '', lang = '', limit = 0 } = $props();
	const settings = __EMBED__;

	// Its language: lang="…", else the page's, else the browser's; one it does not know, English.
	$effect(() => {
		const asked = (lang || document.documentElement.lang || navigator.language || 'en').slice(0, 2).toLowerCase();
		i18n.locale = asked in settings.strings ? asked : 'en';
	});

	/** undefined while read, null when it could not be */
	let found = $state(/** @type {import('../../src/lib/profile.js').Profile | null | undefined} */ (undefined));
	$effect(() => {
		const domain = organization;
		found = undefined;
		if (domain) loadProfile(domain).then((p) => domain === organization && (found = p), () => domain === organization && (found = null));
	});
	const jobs = $derived(found ? found.jobs.filter((j) => j.live) : []);
	const shown = $derived(jobs.slice(0, Math.max(1, Number(limit) || settings.shown)));
	const facts = (/** @type {import('../../src/lib/profile.js').Job} */ job) =>
		[job.place, job.remote && t(`job.remote.${job.remote}`), job.employment && t(`job.employment.${job.employment}`)].filter(Boolean).join(' · ');
</script>

<jl-embed>
	{#if found === null}
		<p>{t('embed.error')}</p>
	{:else}
		<h2><a href="{settings.site}/{organization}" target="_blank" rel="noopener">{t('embed.title', { name: found?.company?.name || organization })}</a></h2>
		{#if found}
			<p>{jobs.length ? t('embed.count', { count: jobs.length }) : t('embed.none')}</p>
			<ul>
				{#each shown as job (job.rkey)}
					<li>
						<a href="{settings.site}{jobPath(found.did, job.rkey)}" target="_blank" rel="noopener">{job.title}</a>
						{#if facts(job)}<small>{facts(job)}</small>{/if}
					</li>
				{/each}
			</ul>
		{/if}
		<footer><a href="{settings.site}/{organization}" target="_blank" rel="noopener">{t('embed.by')}</a></footer>
	{/if}
</jl-embed>

<style>
	/* Its colors from the page's, unless set. */
	jl-embed {
		--color-fg: var(--joblist-fg, currentColor);
		--color-muted: var(--joblist-muted, rgb(128 128 128));
		--color-line: var(--joblist-line, rgb(128 128 128 / 0.3));
		display: block;
		font-family: var(--joblist-font, inherit);
		color: var(--color-fg);
		line-height: 1.45;
	}
	h2 {
		margin: 0 0 0.25rem;
		font-size: 1.15em;
	}
	a {
		color: inherit;
	}
	h2 a {
		text-decoration: none;
	}
	ul {
		margin: 0.5rem 0;
		padding: 0;
		list-style: none;
	}
	li {
		display: grid;
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--color-line);
	}
	li a {
		font-weight: 600;
		text-decoration: none;
	}
	li a:hover,
	h2 a:hover {
		text-decoration: underline;
	}
	p,
	small,
	footer {
		margin: 0;
		color: var(--color-muted);
		font-size: 0.875rem;
	}
</style>
