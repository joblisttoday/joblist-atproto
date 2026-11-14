<script>
	import { goto } from '$app/navigation';
	import Icon from './Icon.svelte';
	import PlacesMap from './PlacesMap.svelte';
	import config from '#lib/data/config.json';
	import { match, organizations, reading } from '#lib/directory.svelte.js';
	import { jobPath } from '#lib/records.js';
	import { locationPoints } from '#lib/places.js';
	import { domainOf } from '#lib/profile.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Search, on the home: the organizations on joblist and their open jobs (directory:
	 * read from their own accounts, found through the network), by what they say; a domain
	 * opens its page. Their places, on a map.
	 * @type {{query?: string}}
	 */
	let { query = $bindable('') } = $props();
	const id = $props.id();
	const typed = $derived(query.trim());
	const asking = $derived(typed.length >= config.search.minLength);
	/** Read once a search starts (organizations() reads them once per visit). */
	const loading = $derived(asking ? organizations() : null);
	const domain = $derived(domainOf(typed));

	/** @param {import('#lib/profile.js').Profile[]} all */
	const found = (all) => match(all, typed);
	/** @param {ReturnType<typeof match>} result */
	const points = (result) => [
		...result.organizations.flatMap((p) => locationPoints(p.company?.locations || []).map((l) => ({ ...l, label: p.company?.name || p.domain, href: `/${p.domain}` }))),
		...result.jobs.flatMap(({ profile, job }) => locationPoints(job.locations).map((l) => ({ ...l, label: job.title, href: jobPath(profile.did, job.rkey) })))
	];

	/** Enter: a domain opens its page; else the first organization found. @param {SubmitEvent} event */
	async function submit(event) {
		event.preventDefault();
		if (domain) return goto(`/${domain}`);
		const first = loading ? found(await loading).organizations[0] : null;
		if (first) goto(`/${first.domain}`);
	}
</script>

<form role="search" onsubmit={submit}>
	<label for={id} data-hidden>{t('search.label')}</label>
	<Icon name="search" />
	<input {id} bind:value={query} type="search" placeholder={t('search.placeholder')} enterkeyhint="search" autocomplete="off" autocapitalize="none" spellcheck="false" />
</form>

{#if asking}
	<jl-results aria-live="polite">
		{#if domain}
			<ul data-rows>
				<li><a href="/{domain}"><Icon name="organization" /><span>{t('search.open', { domain })}</span></a></li>
			</ul>
		{/if}
		{#await loading}
			<p><small>{reading.total ? t('search.reading', { done: reading.done, total: reading.total }) : t('profile.reading')}</small></p>
		{:then all}
			{@const result = found(all || [])}
			<jl-wide>
				<div>
					{#if result.organizations.length}
						<h2>{t('search.organizations')}</h2>
						<ul data-rows>
							{#each result.organizations.slice(0, config.search.shown) as p (p.domain)}
								<li>
									<a href="/{p.domain}">
										{#if p.avatar}<img src={p.avatar} alt="" />{:else}<b data-initial aria-hidden="true">{(p.company?.name || p.domain).charAt(0).toUpperCase()}</b>{/if}
										<span><b>{p.company?.name || p.domain}</b> <small>{p.domain}</small></span>
									</a>
								</li>
							{/each}
						</ul>
					{/if}
					{#if result.jobs.length}
						<h2>{t('search.jobs')}</h2>
						<ul data-rows>
							{#each result.jobs.slice(0, config.search.shown) as { profile, job } (`${profile.did}/${job.rkey}`)}
								<li>
									<a href={jobPath(profile.did, job.rkey)}>
										<Icon name="post" />
										<span><b>{job.title}</b> <small>{[profile.company?.name || profile.domain, job.place].filter(Boolean).join(' · ')}</small></span>
									</a>
								</li>
							{/each}
						</ul>
					{/if}
					{#if !result.organizations.length && !result.jobs.length && !domain}<p>{t('search.none')}</p>{/if}
				</div>
				<aside><PlacesMap points={points(result)} /></aside>
			</jl-wide>
		{:catch}
			<p role="alert">{t('search.failed')}</p>
		{/await}
	</jl-results>
{/if}

<style>
	form {
		display: flex;
		align-items: center;
		gap: var(--space-s);
		width: 100%;
		max-width: var(--reading-width);
		margin-inline: auto;
		padding-inline: var(--space-m);
		border: var(--control-border);
		border-radius: var(--radius-round);
		background: var(--color-bg);
		color: var(--color-muted);
	}
	form:focus-within {
		outline: 2px solid var(--color-focus);
		outline-offset: 2px;
	}
	input {
		flex: 1;
		min-width: 0;
		min-height: var(--tap-size);
		padding: 0;
		border: 0;
		background: none;
		color: var(--color-fg);
	}
	input:focus {
		outline: none;
	}
	[data-hidden] {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
	}
	jl-results {
		display: block;
		margin-top: var(--space-m);
		text-align: start;
	}
	h2 {
		margin: var(--space-m) 0 var(--space-xs);
		font-size: var(--font-size-small);
		color: var(--color-muted);
	}
	[data-rows] {
		margin: 0;
		padding: 0;
		list-style: none;
		border: var(--border);
		border-radius: var(--radius-large);
		overflow: hidden;
	}
	[data-rows] li + li {
		border-top: var(--border);
	}
	[data-rows] a {
		display: flex;
		align-items: center;
		gap: var(--space-s);
		min-height: var(--tap-size);
		padding: var(--space-xs) var(--space-m);
		color: var(--color-fg);
		text-decoration: none;
	}
	[data-rows] a:hover {
		background: var(--color-soft);
	}
	[data-rows] span {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	[data-rows] small {
		color: var(--color-muted);
	}
	[data-rows] img,
	[data-initial] {
		display: grid;
		place-items: center;
		flex: none;
		width: 1.75rem;
		height: 1.75rem;
		border-radius: var(--radius-round);
		background: var(--color-soft);
		object-fit: cover;
		font-size: var(--font-size-small);
	}
</style>
