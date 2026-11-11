<script>
	import Icon from '#lib/components/Icon.svelte';
	import config from '#lib/data/config.json';
	import Empty from '#lib/components/Empty.svelte';
	import JobItem from '#lib/components/JobItem.svelte';
	import JobsMap from '#lib/components/JobsMap.svelte';
	import ViewSwitch from '#lib/components/ViewSwitch.svelte';
	import { pageView } from '#lib/navigation/page-view.svelte.js';
	import MyJobPosts from '#lib/components/MyJobPosts.svelte';
	import { data } from '#lib/network/network.svelte.js';
	import { getProfile, postsBy } from '#lib/network/profile.svelte.js';
	import { toJob } from '#lib/models/job-post.js';
	import { t } from '#lib/i18n/index.svelte.js';

	// An account's page: the job offers it posted, as a list, a grid or on the map; its own, to edit, renew or delete them.
	const profile = getProfile();
	const posts = $derived(profile.did ? postsBy(profile.did, profile.self) : []);
	const jobs = $derived(posts.map(toJob));
	const names = $derived(new Map(jobs.map((j) => [j.company, data.companies.get(j.company)?.name || j.company])));
	const shown = pageView('jobs');
	const mapless = $derived(!jobs.some((j) => j.point));
</script>

<svelte:head><title>@{profile.handle} · {config.name}</title></svelte:head>

<section aria-labelledby="profile-jobs">
	<jl-visually-hidden><h2 id="profile-jobs">{t('profile.jobs')}</h2></jl-visually-hidden>
	{#if profile.self}
		{#if posts.length}<MyJobPosts {posts} />{/if}
		<menu><a href="/jobs/new" data-add={posts.length ? '' : 'main'}><Icon name="add" /> {t('post.title')}</a></menu>
	{:else if posts.length}
		<menu data-views><ViewSwitch bind:view={shown.view} page="jobs" {mapless} /></menu>
		{#if shown.view === 'map' && !mapless}
			<jl-profile-map><JobsMap {jobs} {names} fit /></jl-profile-map>
		{:else}
			<ul data-view={shown.view}>
				{#each jobs as job (job.url)}
					<li><JobItem {job} company={names.get(job.company) || job.company} /></li>
				{/each}
			</ul>
		{/if}
	{:else}
		<Empty text={t('profile.empty')} />
	{/if}
</section>

<style>
	ul {
		display: grid;
		grid-template-columns: var(--columns);
		column-gap: var(--column-gap);
		padding: 0;
		list-style: none;
	}
	ul[data-view='list'] {
		grid-template-columns: 1fr;
	}
	menu[data-views] {
		justify-content: flex-end;
	}
	jl-profile-map {
		display: block;
		height: var(--map-height);
	}
</style>
