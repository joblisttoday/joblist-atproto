<script>
	import Icon from '#lib/components/Icon.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import config from '#lib/data/config.json';
	import Companies from '#lib/components/Companies.svelte';
	import JobItem from '#lib/components/JobItem.svelte';
	import ListItem from '#lib/components/ListItem.svelte';
	import LocaleSwitch from '#lib/components/LocaleSwitch.svelte';
	import MyJobPosts from '#lib/components/MyJobPosts.svelte';
	import ProfileHeader from '#lib/components/ProfileHeader.svelte';
	import { resolveDid } from '#lib/atproto/identity.js';
	import { session, signOut } from '#lib/auth/session.svelte.js';
	import { data, handleOf } from '#lib/network/network.svelte.js';
	import { listJobStats } from '#lib/network/job-counts.svelte.js';
	import { findLists } from '#lib/models/list-filters.js';
	import { isLive, toJob } from '#lib/models/job-post.js';
	import { t } from '#lib/i18n/index.svelte.js';

	const handle = $derived(page.params.handle || '');
	const did = $derived(resolveDid(handle));

	/** @param {import('#lib/models/list.js').List[]} lists */
	function usefulFirst(lists) {
		const stats = new Map(lists.map((l) => [l.uri, listJobStats(l)]));
		return findLists(lists, { query: '', hiring: false, open: false, mine: false }, stats, { handleOf });
	}

	async function out() {
		await signOut();
		await goto('/');
	}
</script>

<svelte:head><title>@{handle} · {config.name}</title></svelte:head>

{#await did}
	<ProfileHeader {handle} />
{:then did}
	{@const self = session.did === did}
	<!-- The most useful first, as on the lists page. -->
	{@const lists = usefulFirst(data.lists.filter((l) => l.did === did))}
	{@const companies = [...data.companies.values()].filter((c) => c.versions.some((v) => v.did === did))}
	<!-- Their own page shows expired offers too, to renew or delete them. -->
	{@const posts = data.posts.filter((p) => p.did === did && (self || isLive(p.record.value)))}
	<jl-profile self={self || undefined}>
		<ProfileHeader {did} {handle}>
			{#if self}
				<menu><button type="button" onclick={out}>{t('me.signout')}</button></menu>
				<LocaleSwitch />
			{/if}
		</ProfileHeader>

		<section aria-labelledby="profile-lists">
			<h2 id="profile-lists">{t('profile.lists')} <small>{lists.length || ''}</small></h2>
			{#if lists.length}
				<ul>{#each lists as list (list.uri)}<li><ListItem {list} author={false} /></li>{/each}</ul>
			{:else}
				<p><small>{self ? t('me.lists.empty') : t('profile.empty')}</small></p>
			{/if}
			{#if self}<menu><a href="/lists/new"><Icon name="add" /> {t('list.new')}</a></menu>{/if}
		</section>

		{#if self || posts.length}
			<section aria-labelledby="profile-jobs">
				<h2 id="profile-jobs">{t('profile.jobs')} <small>{posts.length || ''}</small></h2>
				{#if self}
					<MyJobPosts {posts} />
					<menu><a href="/jobs/new"><Icon name="add" /> {t('post.title')}</a></menu>
				{:else}
					<ul>
						{#each posts.map(toJob) as job (job.url)}
							<li><JobItem {job} company={data.companies.get(job.company)?.name || job.company} /></li>
						{/each}
					</ul>
				{/if}
			</section>
		{/if}

		<section aria-labelledby="profile-companies">
			<h2 id="profile-companies">{t('profile.companies')} <small>{companies.length || ''}</small></h2>
			{#if companies.length}
				<Companies {companies} searchable={companies.length > 10} />
			{:else}
				<p><small>{self ? t('me.companies.empty') : t('profile.empty')}</small></p>
			{/if}
			{#if self}<menu><a href="/add"><Icon name="add" /> {t('form.company.title')}</a></menu>{/if}
		</section>
	</jl-profile>
{:catch}
	<h1>@{handle}</h1>
	<p role="alert">{t('profile.notFound')}</p>
{/await}

<style>
	jl-profile {
		display: block;
	}
	/* Lists in as many columns as fit, like the companies under them. */
	section[aria-labelledby='profile-lists'] > ul {
		display: grid;
		grid-template-columns: var(--columns);
		column-gap: var(--column-gap);
	}
</style>
