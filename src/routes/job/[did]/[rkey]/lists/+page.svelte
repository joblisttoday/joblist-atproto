<script>
	import { page } from '$app/state';
	import config from '#lib/data/config.json';
	import Pending from '#lib/components/Pending.svelte';
	import PostInLists from '#lib/components/PostInLists.svelte';
	import RequireSession from '#lib/components/RequireSession.svelte';
	import { session } from '#lib/auth/session.svelte.js';
	import { postPath } from '#lib/models/job-post.js';
	import { t } from '#lib/i18n/index.svelte.js';
	import { findPost } from '#lib/network/find-post.svelte.js';

	// After posting a job (or from "Your job posts"): where it can show.
	const did = $derived(page.params.did || '');
	const found = findPost(() => ({ did, rkey: page.params.rkey || '' }));
	const post = $derived(found.post);
</script>

<svelte:head><title>{t('post.lists.title')} · {config.name}</title></svelte:head>

<h1>{t('post.lists.title')}</h1>

<RequireSession>
	{#if post && session.did === post.did}
		<p><small>{t('post.lists.job', { title: post.title })}</small></p>
		<PostInLists {post} />
		<menu><a href={postPath(post.did, post.rkey)}>{t('post.lists.done')}</a></menu>
	{:else if post === undefined}
		<Pending />
	{:else}
		<p>{t('job.notFound')}</p>
	{/if}
</RequireSession>

<style>
	menu {
		margin-top: var(--space-l);
	}
</style>
