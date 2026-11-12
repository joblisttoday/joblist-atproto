<script>
	import { session } from '#lib/auth/session.svelte.js';
	import CardMenu from './CardMenu.svelte';
	import Icon from './Icon.svelte';
	import Row from './Row.svelte';
	import { accountOf, thumbnail } from '#lib/network/accounts.svelte.js';
	import providers from '#lib/data/providers.json';
	import { boardOfKept, keyOf } from '#lib/models/kept.js';
	import { filterJobs, offerCount } from '#lib/models/job.js';
	import { searches } from '#lib/network/saved-searches.svelte.js';
	import { forget, kept } from '#lib/network/kept.svelte.js';
	import { keptJobs } from '#lib/network/kept-jobs.svelte.js';
	import config from '#lib/data/config.json';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * The organizations followed in this browser, newest first, as every row: its picture, its
	 * name, its open jobs (read live from its board, kept-jobs.svelte.js) and tags, those
	 * published lately (config.kept.newDays) as its chip; with no board known, a way to look
	 * for it (on its page); Unfollow in its "…". Its page is its domain's (/{domain}), or the
	 * link's own (/explore/organization#url=…).
	 * max: only the first ones; tag: only those with this tag.
	 * @type {{max?: number, tag?: string}}
	 */
	let { max = Infinity, tag = '' } = $props();
	const shown = $derived(kept.list.filter((k) => !tag || k.tags?.includes(tag)).slice(0, max));
	const companies = $derived(new Map(kept.list.map((k, i) => [k.url, keptJobs.companies[i]])));
	const counts = $derived(new Map([...keptJobs.jobs].map(([key, list]) => [key, offerCount(list)])));
	const since = Date.now() - config.kept.newDays * 24 * 3600 * 1000;
	const fresh = $derived(new Map([...keptJobs.jobs].map(([key, list]) => [key, offerCount(list.filter((j) => Date.parse(j.published || '') >= since))])));
	// With searches saved: how many of its jobs match one of them (its chip, rather than this week's).
	const names = $derived(new Map(keptJobs.companies.map((c) => [c.key, c.name])));
	const matching = $derived(
		searches.list.length ? new Map([...keptJobs.jobs].map(([key, list]) => [key, offerCount(filterJobs(list, { query: '', where: '', remote: '', any: searches.list }, names))])) : null
	);

	/** The link, short: its host and path. @param {string} url */
	function short(url) {
		const u = new URL(url);
		return `${u.hostname.replace(/^www\./, '')}${u.pathname === '/' ? '' : u.pathname.replace(/\/$/, '')}`;
	}
	/** @param {string} id */
	const provider = (id) => providers.find((p) => p.id === id)?.name || id;
	/** @param {import('#lib/models/kept.js').Kept} item */
	const pageOf = (item) => (keyOf(item.url) ? `/${keyOf(item.url)}` : `/explore/organization#${new URLSearchParams({ url: item.url })}`);
</script>

<jl-kept-organizations>
	{#each shown as item (item.url)}
		{@const company = companies.get(item.url)}
		{@const board = boardOfKept(item)}
		{@const count = company ? counts.get(company.key) : undefined}
		{@const lately = company ? fresh.get(company.key) || 0 : 0}
		{@const matched = company && matching && count !== undefined ? matching.get(company.key) || 0 : null}
		{@const name = item.name || company?.name || short(item.url)}
		{@const key = keyOf(item.url) || item.url}
		{@const picture = accountOf(key)?.avatar}
		<Row
			href={pageOf(item)}
			title={name}
			avatar={{ key, name, src: picture ? thumbnail(picture) : '' }}
			chip={matched !== null
				? { text: t('kept.matching', { count: matched }), tone: matched ? 'ok' : undefined }
				: lately
					? { text: t('kept.new', { count: lately }), tone: 'ok' }
					: count === undefined && !board
						? { text: t('kept.find'), tone: 'warn' }
						: null}
			meta={[
				count !== undefined ? (count ? t('kept.jobs', { count }) : t('kept.noJobs')) : board ? t('kept.board', { provider: provider(board.provider) }) : t('kept.noBoard'),
				item.tags?.join(', ')
			]}
		>
			{#snippet menu()}
				<CardMenu label={t('card.actions', { name })}>
					{#snippet items(done)}
						<li><a href={pageOf(item)} onclick={done}><Icon name="companies" /> {name}</a></li>
						{#if session.handle && keyOf(item.url) === session.handle}<li><a href="/{session.handle}/edit" onclick={done}><Icon name="edit" /> {t('company.edit')}</a></li>{/if}
						<li><button type="button" onclick={() => (forget(item.url), done())}><Icon name="close" /> {t('kept.forget', { name })}</button></li>
					{/snippet}
				</CardMenu>
			{/snippet}
		</Row>
	{/each}
</jl-kept-organizations>

<style>
	jl-kept-organizations {
		display: block;
	}
</style>
