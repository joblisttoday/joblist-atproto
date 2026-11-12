<script>
	import { goto } from '$app/navigation';
	import config from '#lib/data/config.json';
	import Empty from '#lib/components/Empty.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import Pending from '#lib/components/Pending.svelte';
	import { curatedLink } from '#lib/models/curated.js';
	import { slugify } from '#lib/models/landing.js';
	import { readAddress } from '#lib/navigation/address.js';
	import { readCurated } from '#lib/network/curated.js';
	import { isKeptLink, keepAll } from '#lib/network/kept.svelte.js';
	import { formatNumber, t } from '#lib/i18n/index.svelte.js';

	/**
	 * Follow the organizations of a list someone curates on Bluesky (/following/list#url=…: a
	 * list, a starter pack, the accounts someone follows): its accounts with a domain of their
	 * own, those publishing their page on joblist first, all chosen; followed here, privately,
	 * tagged with the list's name. Anyone curates: joblist keeps no list.
	 */
	const link = readAddress(['url']).get('url') || '';
	const curated = curatedLink(link);
	/** @type {Promise<{name: string, candidates: import('#lib/models/curated.js').Candidate[]}> | null} */
	const reading = curated ? readCurated(curated) : null;
	/** @type {Set<string>} */
	let skipped = $state(new Set());

	/** @param {{name: string, candidates: import('#lib/models/curated.js').Candidate[]}} read */
	function follow(read) {
		const tag = slugify(read.name);
		const at = new Date().toISOString();
		keepAll(read.candidates.filter((c) => !skipped.has(c.did)).map((c) => ({ url: c.url, name: c.name, at, ...(tag ? { tags: [tag] } : {}) })));
		goto('/following');
	}
	/** @param {string} did */
	function toggle(did) {
		const next = new Set(skipped);
		if (next.has(did)) next.delete(did);
		else next.add(did);
		skipped = next;
	}
</script>

<svelte:head><title>{t('curated.title')} · {config.name}</title></svelte:head>

<jl-curated>
	{#if !reading}
		<Empty text={t('curated.invalid')}><a href="/following">{t('nav.following')}</a></Empty>
	{:else}
		{#await reading}
			<h1>{t('curated.title')}</h1>
			<Pending />
		{:then read}
			{@const chosen = read.candidates.filter((c) => !skipped.has(c.did)).length}
			<h1>{read.name || t('curated.title')}</h1>
			<p><small>{t('curated.intro')}</small></p>
			{#if read.candidates.length}
				<ul>
					{#each read.candidates as c (c.did)}
						{@const already = isKeptLink(c.url)}
						<li>
							<label>
								<input type="checkbox" checked={already || !skipped.has(c.did)} disabled={already} onchange={() => toggle(c.did)} />
								{#if c.avatar}<img src={c.avatar} alt="" />{/if}
								<span>{c.name} <small>{c.url.replace('https://', '')}{c.onJoblist ? ` · ${t('curated.onJoblist')}` : ''}{already ? ` · ${t('follow.done')}` : ''}</small></span>
							</label>
						</li>
					{/each}
				</ul>
				<menu><button type="button" data-primary disabled={!chosen} onclick={() => follow(read)}><Icon name="save" /> {t('curated.follow', { count: formatNumber(chosen) })}</button></menu>
			{:else}
				<Empty text={t('curated.none')} />
			{/if}
		{:catch}
			<h1>{t('curated.title')}</h1>
			<Empty text={t('curated.unread')}><a href="/following">{t('nav.following')}</a></Empty>
		{/await}
	{/if}
</jl-curated>

<style>
	jl-curated {
		display: block;
		max-width: var(--reading-width);
		margin-inline: auto;
		padding-bottom: var(--space-xl);
	}
	ul {
		margin: var(--space-m) 0;
		padding: 0;
		list-style: none;
	}
	li + li {
		border-top: var(--border);
	}
	label {
		display: flex;
		align-items: center;
		gap: var(--space-s);
		min-height: var(--tap-size);
		font-weight: normal;
	}
	label span {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	small {
		color: var(--color-muted);
	}
	img {
		width: var(--avatar-small);
		height: var(--avatar-small);
		border-radius: var(--radius-round);
		object-fit: cover;
	}
	[data-primary] {
		background: var(--color-accent);
		color: var(--color-accent-fg);
		border-color: var(--color-accent);
	}
</style>
