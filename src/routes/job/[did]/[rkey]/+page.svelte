<script>
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import config from '#lib/data/config.json';
	import JobPosting from '#lib/components/JobPosting.svelte';
	import NetworkStatus from '#lib/components/NetworkStatus.svelte';
	import { data } from '#lib/network/network.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';
	import { findPost } from '#lib/network/find-post.svelte.js';

	const found = findPost(() => ({ did: page.params.did || '', rkey: page.params.rkey || '' }));
	const post = $derived(found.post);
	const company = $derived(post ? data.companies.get(post.company)?.name || post.company : '');
</script>

<svelte:head>
	<title>{post ? t('job.at', { title: post.title, company }) : t('job.notFoundTitle')} · {config.name}</title>
</svelte:head>

{#if post}
	<JobPosting {post} ondeleted={() => goto(`/company/${post.company}`)} />
{:else if post === null}
	<h1>{t('job.notFoundTitle')}</h1>
	<p>{t('job.notFound')}</p>
{:else}
	<NetworkStatus />
{/if}
