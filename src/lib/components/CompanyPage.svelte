<script>
	import CompanyHeader from './CompanyHeader.svelte';
	import CompanyJobs from './CompanyJobs.svelte';
	import BoardFinder from './BoardFinder.svelte';
	import Icon from './Icon.svelte';
	import { session } from '#lib/auth/session.svelte.js';
	import { data } from '#lib/network/network.svelte.js';
	import { ATPROTO, boardUrl, mayDescribe } from '#lib/models/company.js';
	import { placeCounts } from '#lib/models/job.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * An organization's careers page, the same whether it publishes it (/{domain}) or only this
	 * browser knows it (local: /me/organization#url=…, or a domain that does not publish one):
	 * its head (Save), then its jobs, opened in a dialog. Its own account sees it as anyone does,
	 * with one bar to manage it (/organization); anyone else, at the end, how to publish theirs.
	 * address: what its address keeps besides its jobs' search (a local one's #url=…).
	 * onboard: a local one's job board, found by its name (BoardFinder).
	 * @type {{company: import('#lib/models/company.js').Company, local?: import('#lib/models/kept.js').Local, address?: Record<string, string>, onboard?: (board: {provider: string, id: string}) => void}}
	 */
	let { company, local, address = {}, onboard } = $props();
	const key = $derived(company.key);
	const owner = $derived(!local && mayDescribe(company, session));
	// Jobs come from its job board, or it posts them from its own account.
	const hasJobs = $derived(Boolean(boardUrl(company.jobBoard) || company.jobBoard?.provider === ATPROTO || (!local && data.postedJobs.has(key))));
	/** @type {import('#lib/ats/job.js').Job[]} */
	let jobs = $state.raw([]);
	const places = $derived(
		local
			? placeCounts(jobs, 5).map(([place]) => place)
			: (company.locations || []).map((l) => l.name || [l.address, l.country].filter(Boolean).join(', ')).filter(Boolean)
	);
	const claim = $derived(local ? local.suggest : `/add?url=${encodeURIComponent(`https://${key}`)}`);
</script>

<jl-company-page>
	{#if owner}
		<jl-company-owner>
			<span>{t('orgs.yourPage')}</span>
			<a href="/organization"><Icon name="settings" /> {t('orgs.manage')}</a>
		</jl-company-owner>
	{/if}
	<CompanyHeader {company} {local} {places} />

	<section aria-labelledby="company-jobs">
		<jl-visually-hidden><h2 id="company-jobs">{t('list.tab.jobs')}</h2></jl-visually-hidden>
		{#if hasJobs}
			<CompanyJobs {company} bind:jobs {address} local={Boolean(local)} />
		{:else}
			<p>{t('org.jobsThere')} <a href={local?.link || company.url || `https://${key}`} target="_blank" rel="noopener noreferrer">{key}</a></p>
			{#if onboard}<BoardFinder name={company.name} domain={company.url ? key : ''} onpick={onboard} />{/if}
		{/if}
	</section>

	{#if !owner && !company.verified}
		<p data-claim><small><a href={claim}>{t('company.claim.short')}</a></small></p>
	{/if}
</jl-company-page>

<style>
	jl-company-page {
		display: block;
	}
	jl-company-owner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-s);
		margin-top: var(--space-s);
		padding: var(--space-xs) var(--space-m);
		border-radius: var(--radius);
		background: var(--color-soft);
		font-size: var(--font-size-small);
	}
	section {
		margin-top: var(--space-m);
	}
	[data-claim] {
		margin-top: var(--space-xl);
		text-align: center;
	}
</style>
