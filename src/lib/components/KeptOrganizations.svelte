<script>
	import Icon from './Icon.svelte';
	import providers from '#lib/data/providers.json';
	import { boardOfKept, keyOf } from '#lib/models/kept.js';
	import { offerCount } from '#lib/models/job.js';
	import { forget, kept } from '#lib/network/kept.svelte.js';
	import { keptJobs } from '#lib/network/kept-jobs.svelte.js';
	import config from '#lib/data/config.json';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * The organizations followed in this browser, newest first, each with its open jobs (read
	 * live from its board, kept-jobs.svelte.js) and those published lately
	 * (config.kept.newDays), or, with no board known, a way to look for it (on its page):
	 * its page is its domain's (/{domain}), or the link's own (/me/organization#url=…).
	 * max: only the first ones; tag: only those with this tag.
	 * @type {{max?: number, tag?: string}}
	 */
	let { max = Infinity, tag = '' } = $props();
	const shown = $derived(kept.list.filter((k) => !tag || k.tags?.includes(tag)).slice(0, max));
	const companies = $derived(new Map(kept.list.map((k, i) => [k.url, keptJobs.companies[i]])));
	const counts = $derived(new Map([...keptJobs.jobs].map(([key, list]) => [key, offerCount(list)])));
	const since = Date.now() - config.kept.newDays * 24 * 3600 * 1000;
	const fresh = $derived(new Map([...keptJobs.jobs].map(([key, list]) => [key, offerCount(list.filter((j) => Date.parse(j.published || '') >= since))])));

	/** The link, short: its host and path. @param {string} url */
	function short(url) {
		const u = new URL(url);
		return `${u.hostname.replace(/^www\./, '')}${u.pathname === '/' ? '' : u.pathname.replace(/\/$/, '')}`;
	}
	/** @param {string} id */
	const provider = (id) => providers.find((p) => p.id === id)?.name || id;
	/** @param {import('#lib/models/kept.js').Kept} item */
	const pageOf = (item) => (keyOf(item.url) ? `/${keyOf(item.url)}` : `/me/organization#${new URLSearchParams({ url: item.url })}`);
</script>

<jl-kept-organizations>
	<ul>
		{#each shown as item (item.url)}
			{@const company = companies.get(item.url)}
			{@const board = boardOfKept(item)}
			{@const count = company ? counts.get(company.key) : undefined}
			{@const lately = company ? fresh.get(company.key) || 0 : 0}
			{@const name = item.name || company?.name || short(item.url)}
			<li>
				<a href={pageOf(item)}>
					<span>{name}</span>
					<small>
						{#if count !== undefined}{count ? t('kept.jobs', { count }) : t('kept.noJobs')}{#if lately}{' · '}<strong>{t('kept.new', { count: lately })}</strong>{/if}
						{:else if board}{t('kept.board', { provider: provider(board.provider) })}
						{:else}{t('kept.noBoard')} · <span data-find>{t('kept.find')}</span>{/if}
						{#if item.tags?.length}{' · '}{item.tags.join(', ')}{/if}
					</small>
				</a>
				<button type="button" onclick={() => forget(item.url)}><Icon name="close" label={t('kept.forget', { name })} /></button>
			</li>
		{/each}
	</ul>
</jl-kept-organizations>

<style>
	jl-kept-organizations {
		display: block;
	}
	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	li {
		display: flex;
		align-items: center;
		gap: var(--space-s);
		border-bottom: var(--border);
	}
	a:first-child {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
		min-height: var(--tap-size);
		padding: var(--space-s) 0;
		color: var(--color-fg);
		text-decoration: none;
	}
	a:first-child span {
		display: inline-flex;
		align-items: center;
		gap: var(--space-xs);
		font-weight: var(--font-weight-strong);
	}
	small strong,
	[data-find] {
		color: var(--color-ok);
	}
	[data-find] {
		text-decoration: underline;
	}
	small {
		color: var(--color-muted);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	button {
		flex: none;
		min-width: var(--tap-size);
		min-height: var(--tap-size);
		border: 0;
		background: none;
		color: var(--color-muted);
	}
</style>
