<script>
	import { page } from '$app/state';
	import config from '#lib/data/config.json';
	import Companies from '#lib/components/Companies.svelte';
	import JobItem from '#lib/components/JobItem.svelte';
	import ListItem from '#lib/components/ListItem.svelte';
	import ProfileHeader from '#lib/components/ProfileHeader.svelte';
	import { resolveDid } from '#lib/atproto/identity.js';
	import { data } from '#lib/network/network.svelte.js';
	import { isLive, toJob } from '#lib/models/job-post.js';
	import { t } from '#lib/i18n/index.svelte.js';

	const handle = $derived(page.params.handle || '');
	const did = $derived(resolveDid(handle));
</script>

<svelte:head><title>@{handle} · {config.name}</title></svelte:head>

{#await did}
	<ProfileHeader {handle} />
{:then did}
	{@const lists = data.lists.filter((l) => l.did === did)}
	{@const companies = [...data.companies.values()].filter((c) => c.versions.some((v) => v.did === did))}
	{@const jobs = data.posts.filter((p) => p.did === did && isLive(p.record.value)).map(toJob)}
	<ProfileHeader {did} {handle} />
	<section>
		<h2>{t('profile.lists')}</h2>
		{#if lists.length}
			<ul>{#each lists as list (list.uri)}<li><ListItem {list} author={false} /></li>{/each}</ul>
		{:else}
			<p><small>{t('profile.empty')}</small></p>
		{/if}
	</section>
	{#if jobs.length}
		<section>
			<h2>{t('profile.jobs')} <small>{jobs.length}</small></h2>
			<ul>
				{#each jobs as job (job.url)}
					<li><JobItem {job} company={data.companies.get(job.company)?.name || job.company} /></li>
				{/each}
			</ul>
		</section>
	{/if}
	<section>
		<h2>{t('profile.companies')} <small>{companies.length || ''}</small></h2>
		{#if companies.length}
			<Companies {companies} searchable={companies.length > 10} />
		{:else}
			<p><small>{t('profile.empty')}</small></p>
		{/if}
	</section>
{:catch}
	<h1>@{handle}</h1>
	<p role="alert">{t('profile.notFound')}</p>
{/await}
