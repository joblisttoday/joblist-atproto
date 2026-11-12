<script>
	import { goto } from '$app/navigation';
	import config from '#lib/data/config.json';
	import Empty from '#lib/components/Empty.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import Pending from '#lib/components/Pending.svelte';
	import Row from '#lib/components/Row.svelte';
	import { curatedLink } from '#lib/models/curated.js';
	import { slugify } from '#lib/models/landing.js';
	import { readAddress } from '#lib/navigation/address.js';
	import { readCurated } from '#lib/network/curated.js';
	import { isKeptLink, keepAll } from '#lib/network/kept.svelte.js';
	import { formatNumber, t } from '#lib/i18n/index.svelte.js';

	/**
	 * Follow the organizations of a list someone curates on Bluesky (/explore/list#url=…: a
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
				<jl-rows>
					{#each read.candidates as c (c.did)}
						{@const already = isKeptLink(c.url)}
						<Row
							title={c.name}
							avatar={{ key: c.url, name: c.name, src: c.avatar }}
							meta={[c.url.replace('https://', '')]}
							chip={already ? { text: t('follow.done'), tone: 'ok' } : c.onJoblist ? { text: t('curated.onJoblist'), tone: 'ok' } : null}
							check={{ checked: already || !skipped.has(c.did), disabled: already, onchange: () => toggle(c.did) }}
						/>
					{/each}
				</jl-rows>
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
	small {
		color: var(--color-muted);
	}
	jl-rows {
		display: block;
		margin: var(--space-m) 0;
	}
	[data-primary] {
		background: var(--color-accent);
		color: var(--color-accent-fg);
		border-color: var(--color-accent);
	}
</style>
