<script>
	import Icon from './Icon.svelte';
	import providers from '#lib/data/providers.json';
	import { detectBoard } from '#lib/ats/detect.js';
	import { knownBy } from '#lib/models/kept.js';
	import { forget, kept } from '#lib/network/kept.svelte.js';
	import { jobCounts } from '#lib/network/job-counts.svelte.js';
	import { data } from '#lib/network/network.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * The organizations kept in this browser, newest first. One joblist knows leads to its
	 * page, with its open jobs; another to what this browser finds of it (/me/organization),
	 * from where it can be suggested to joblist.
	 * max: only the first ones (at a glance, on /me).
	 * @type {{max?: number}}
	 */
	let { max = Infinity } = $props();
	const shown = $derived(kept.list.slice(0, max));
	const known = $derived(knownBy(data.companies));
	const counts = $derived(jobCounts());

	/** The link, short: its host and path. @param {string} url */
	function short(url) {
		const u = new URL(url);
		return `${u.hostname.replace(/^www\./, '')}${u.pathname === '/' ? '' : u.pathname.replace(/\/$/, '')}`;
	}
	/** @param {string} id */
	const provider = (id) => providers.find((p) => p.id === id)?.name || id;
</script>

<jl-kept-organizations>
	<ul>
		{#each shown as item (item.url)}
			{@const company = known(item.url)}
			{@const board = company ? null : detectBoard(item.url)}
			{@const count = company ? counts.get(company.key) || 0 : 0}
			<li>
				{#if company}
					<a href="/company/{company.key}">
						<span>{item.name || company.name}</span>
						<small>{count ? t('kept.jobs', { count }) : t('kept.noJobs')}</small>
					</a>
				{:else}
					<a href="/me/organization#{new URLSearchParams({ url: item.url })}">
						<span>{item.name || short(item.url)}</span>
						<small>{board ? t('kept.board', { provider: provider(board.provider) }) : short(item.url)}</small>
					</a>
				{/if}
				<button type="button" onclick={() => forget(item.url)}><Icon name="close" label={t('kept.forget', { name: item.name || company?.name || short(item.url) })} /></button>
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
