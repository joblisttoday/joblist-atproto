<script>
	import CompanyHeader from './CompanyHeader.svelte';
	import CompanyJobs from './CompanyJobs.svelte';
	import MyJobPosts from './MyJobPosts.svelte';
	import OrganizationSetup from './OrganizationSetup.svelte';
	import { ownOrganization } from '#lib/network/own-organization.svelte.js';
	import BoardFinder from './BoardFinder.svelte';
	import Icon from './Icon.svelte';
	import { session } from '#lib/auth/session.svelte.js';
	import { data } from '#lib/network/network.svelte.js';
	import { ATPROTO, boardUrl, mayDescribe } from '#lib/models/company.js';
	import { placeCounts } from '#lib/models/job.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * An organization's careers page, the same whether it publishes it (/{domain}) or only this
	 * browser knows it (local: /explore/organization#url=…, or a domain that does not publish one):
	 * its head (Save; its "…": share, its jobs on a website, and to its own account, edit it and
	 * post a job), to its own account its offers (to edit or renew), then its jobs, opened in a dialog. Anyone else, at the end, how to publish theirs.
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
	/** @type {BoardFinder | undefined} */
	let finder = $state();
	let finding = $state(/** @type {'idle' | 'busy' | 'done'} */ ('idle'));
</script>

<jl-company-page>
	<CompanyHeader {company} {local} {places}>
		{#snippet tools()}
			{#if !hasJobs && onboard && finding === 'idle'}
				<button type="button" onclick={() => finder?.look()}><Icon name="search" /> {t('boards.look')}</button>
			{/if}
		{/snippet}
	</CompanyHeader>

	<!-- Its own account: its offers, expired ones too, to edit or renew (posting one: its "…"). -->
	{#if owner && ownOrganization.posts.length}
		<section aria-labelledby="company-offers">
			<h2 id="company-offers">{t('orgs.posts')}</h2>
			<MyJobPosts posts={ownOrganization.posts} />
		</section>
	{/if}

	<section aria-labelledby="company-jobs">
		<jl-visually-hidden><h2 id="company-jobs">{t('list.tab.jobs')}</h2></jl-visually-hidden>
		{#if hasJobs}
			<CompanyJobs {company} bind:jobs {address} local={Boolean(local)} />
		{:else}
			<p>{t('org.jobsThere')} <a href={local?.link || company.url || `https://${key}`} target="_blank" rel="noopener noreferrer">{key}</a></p>
			{#if onboard}<BoardFinder bind:this={finder} bind:step={finding} name={company.name} domain={company.url ? key : ''} onpick={onboard} />{/if}
		{/if}
	</section>

	<!-- Its own account: what to do until its jobs are listed, under them. -->
	{#if owner}<OrganizationSetup />{/if}

</jl-company-page>

<style>
	jl-company-page {
		display: block;
	}
	section {
		margin-top: var(--space-m);
	}
</style>
