<script>
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import config from '#lib/data/config.json';
	import Author from '#lib/components/Author.svelte';
	import CompanyMap from '#lib/components/CompanyMap.svelte';
	import Jobs from '#lib/components/Jobs.svelte';
	import ListItem from '#lib/components/ListItem.svelte';
	import AddToList from '#lib/components/AddToList.svelte';
	import { deleteRecord } from '#lib/atproto/write.js';
	import { session } from '#lib/auth/session.svelte.js';
	import { data, listsWith, network, removeLocal } from '#lib/network/network.svelte.js';
	import { boardUrl, mapPoints } from '#lib/models/company.js';
	import { t } from '#lib/i18n/index.svelte.js';

	const key = $derived(page.params.key || '');
	const company = $derived(data.companies.get(key));
	const lists = $derived(listsWith(key));
	const own = $derived(company?.versions.find((v) => v.did === session.did));

	async function remove() {
		if (!own || !confirm(t('company.confirmDelete'))) return;
		await deleteRecord(config.collections.company, key);
		removeLocal('company', own.uri);
		if (!data.companies.has(key)) await goto('/companies');
	}
</script>

<svelte:head><title>{company?.name || key} · {config.name}</title></svelte:head>

{#if company}
	<jl-company-page verified={company.verified || undefined}>
		<header>
			<h1>{company.name}</h1>
			{#if company.verified}
				<p><small>✓ {t('company.verified', { domain: company.key })}</small></p>
			{/if}
			{#if company.description}<p>{company.description}</p>{/if}
			<p>
				{#if company.url}<a href={company.url} target="_blank" rel="noopener">{t('company.website')}</a>{/if}
				{#if boardUrl(company.jobBoard)}
					· <a href={boardUrl(company.jobBoard)} target="_blank" rel="noopener">{t('company.jobBoard')}</a>
				{/if}
			</p>
			{#if company.tags.length}<p><small>{company.tags.join(' · ')}</small></p>{/if}
			<p>
				<small>
					{t('company.describedBy')} <Author did={company.record.did} />
					{#if company.versions.length > 1}· {t('company.versions', { count: company.versions.length })}{/if}
				</small>
			</p>
			<menu>
				<a href={`/add?key=${encodeURIComponent(key)}`}>{t('company.edit')}</a>
				{#if own}<button type="button" onclick={remove}>{t('company.delete')}</button>{/if}
			</menu>
		</header>

		<section>
			<h2>{t('list.tab.jobs')}</h2>
			<Jobs companies={[company]} />
		</section>

		{#if mapPoints(company).length}
			<section>
				<h2>{t('form.locations')}</h2>
				<ul>
					{#each company.locations as location, i (i)}
						<li><small>{[location.name, location.address, location.country].filter(Boolean).join(', ')}</small></li>
					{/each}
				</ul>
				<CompanyMap companies={[company]} />
			</section>
		{/if}

		<section>
			<h2>{t('company.inLists')}</h2>
			{#if lists.length}
				<ul>
					{#each lists as list (list.uri)}<li><ListItem {list} /></li>{/each}
				</ul>
			{:else}
				<p><small>{t('company.noLists')}</small></p>
			{/if}
			{#if session.did}<AddToList {key} />{/if}
		</section>

		{#if company.versions.length > 1}
			<section>
				<h2>{t('company.versions', { count: company.versions.length })}</h2>
				<ul>
					{#each company.versions as version (version.uri)}
						<li><small><Author did={version.did} /> · {version.value.name}</small></li>
					{/each}
				</ul>
			</section>
		{/if}
	</jl-company-page>
{:else if !network.loading}
	<h1>{key}</h1>
	<p>{t('company.notFound', { key })}</p>
	<menu><a href={`/add?url=${encodeURIComponent(key)}`}>{t('company.describe')}</a></menu>
{/if}

<style>
	jl-company-page {
		display: block;
	}
	menu {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-m);
		padding: 0;
	}
</style>
