<script>
	import Icon from '#lib/components/Icon.svelte';
	import config from '#lib/data/config.json';
	import Empty from '#lib/components/Empty.svelte';
	import JobItem from '#lib/components/JobItem.svelte';
	import MyJobPosts from '#lib/components/MyJobPosts.svelte';
	import { data } from '#lib/network/network.svelte.js';
	import { getProfile, postsBy } from '#lib/network/profile.svelte.js';
	import { toJob } from '#lib/models/job-post.js';
	import { t } from '#lib/i18n/index.svelte.js';

	// The job offers an account posted; its own, to edit, renew or delete them.
	const profile = getProfile();
	const posts = $derived(profile.did ? postsBy(profile.did, profile.self) : []);
</script>

<svelte:head><title>@{profile.handle} · {t('profile.jobs')} · {config.name}</title></svelte:head>

<section aria-labelledby="profile-jobs">
	<jl-visually-hidden><h2 id="profile-jobs">{t('profile.jobs')}</h2></jl-visually-hidden>
	{#if profile.self}
		{#if posts.length}<MyJobPosts {posts} />{/if}
		<menu><a href="/jobs/new" data-add={posts.length ? '' : 'main'}><Icon name="add" /> {t('post.title')}</a></menu>
	{:else if posts.length}
		<ul>
			{#each posts.map(toJob) as job (job.url)}
				<li><JobItem {job} company={data.companies.get(job.company)?.name || job.company} /></li>
			{/each}
		</ul>
	{:else}
		<Empty text={t('profile.empty')} />
	{/if}
</section>
