<script>
	import config from '#lib/data/config.json';
	import Icon from '#lib/components/Icon.svelte';
	import CompanyDelete from '#lib/components/CompanyDelete.svelte';
	import Row from '#lib/components/Row.svelte';
	import CompanyEditor from '#lib/components/CompanyEditor.svelte';
	import { page } from '$app/state';
	import { ownOrganization as org } from '#lib/network/own-organization.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Editing its page (seen by visitors at /{domain}): each part done or not, each edited alone
	 * (?field=…), all of it at once (?all), or its description deleted. With ?field, ?all or
	 * what a link gives (?url=…), the form (CompanyEditor).
	 */
	const editing = $derived(['field', 'all', 'url', 'name', 'board', 'key', 'text', 'title', 'next'].some((k) => page.url.searchParams.has(k)));
	const fields = /** @type {const} */ (['description', 'jobBoard', 'locations', 'tags']);
</script>

<svelte:head><title>{t('orgs.page')} · {config.name}</title></svelte:head>

{#if editing}
	<CompanyEditor />
{:else}
<h1>{t('orgs.page')}</h1>
{#if org.company}
	<p><a href="/{org.own}">{t('orgs.view')} <Icon name="next" /></a></p>
	<jl-rows>
		{#each fields as field (field)}
			{@const done = !org.missing.includes(field)}
			<Row
				href="/org/page?field={field}"
				icon={done ? 'added' : 'add'}
				title={t(`orgs.field.${field}`)}
				chip={done ? null : { text: t('orgs.field.add'), tone: 'warn' }}
			/>
		{/each}
	</jl-rows>
	<menu>
		<a href="/org/page?all">{t('orgs.editAll')}</a>
		<CompanyDelete company={org.company} />
	</menu>
{:else}
	<p>{t('orgs.none')}</p>
	<menu><a href="/org/page?all" data-primary><Icon name="add" /> {t('orgs.describe')}</a></menu>
{/if}
{/if}

<style>
	jl-rows {
		display: block;
		margin: var(--space-m) 0;
	}
	menu {
		gap: var(--space-s);
	}
</style>
