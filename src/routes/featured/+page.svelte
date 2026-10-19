<script>
	import { page } from '$app/state';
	import config from '#lib/data/config.json';
	import revenue from '#lib/data/revenue.json';
	import FeatureCheckout from '#lib/components/FeatureCheckout.svelte';
	import Jobs from '#lib/components/Jobs.svelte';
	import { fromSearch, recordParts } from '#lib/models/featured.js';
	import { postPath } from '#lib/models/job-post.js';
	import { data } from '#lib/network/network.svelte.js';
	import { money } from '#lib/i18n/money.js';
	import { i18n, t } from '#lib/i18n/index.svelte.js';

	// /featured?uri=… (an offer posted here), ?company=…&url=… (a job board's job), or ?company=… (pick one).
	const job = $derived(fromSearch(page.url.searchParams));
	const key = $derived(page.url.searchParams.get('company') || '');
	const post = $derived(job?.kind === 'record' ? data.posts.find((p) => p.uri === job.uri) : undefined);
	const companyKey = $derived(job?.kind === 'board' ? job.company : post?.company || key);
	const company = $derived(data.companies.get(companyKey));
	const title = $derived(post?.title || page.url.searchParams.get('title') || '');
	const href = $derived.by(() => {
		if (job?.kind === 'board') return job.url;
		const { did, rkey } = job ? recordParts(job) : { did: '', rkey: '' };
		return did ? postPath(did, rkey) : '';
	});
	const { price, days, maxPerBlock } = revenue.featured;
</script>

<svelte:head><title>{t('featured.title')} · {config.name}</title></svelte:head>

<jl-featured-page>
	<h1>{t('featured.title')}</h1>
	<p>{t('featured.intro', { price: money(price, revenue.currency, i18n.locale), days })}</p>
	<p>{t('featured.rules', { max: maxPerBlock })}</p>

	{#if job}
		<FeatureCheckout {job} {title} {href} company={company?.name || companyKey} />
	{:else if company}
		<h2>{company.name}</h2>
		<p>{t('featured.pick')}</p>
		<Jobs companies={[company]} featuring />
	{:else}
		<p>{t('featured.howTo')}</p>
		<menu><a href="/jobs">{t('nav.jobs')}</a></menu>
	{/if}
</jl-featured-page>

<style>
	jl-featured-page {
		display: block;
	}
</style>
