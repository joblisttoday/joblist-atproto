<script>
	import config from '#lib/data/config.json';
	import Icon from '#lib/components/Icon.svelte';
	import CompanyDelete from '#lib/components/CompanyDelete.svelte';
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
	<ul>
		{#each fields as field (field)}
			{@const done = !org.missing.includes(field)}
			<li>
				<a href="/org/page?field={field}" data-done={done || undefined}>
					<Icon name={done ? 'added' : 'add'} />
					<span>{t(`orgs.field.${field}`)}</span>
					<small>{done ? t('company.edit') : t('orgs.field.add')}</small>
				</a>
			</li>
		{/each}
	</ul>
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
	ul {
		margin: var(--space-m) 0;
		padding: 0;
		list-style: none;
		border: var(--border);
		border-radius: var(--radius);
	}
	li + li {
		border-top: var(--border);
	}
	ul a {
		display: flex;
		align-items: center;
		gap: var(--space-s);
		min-height: var(--tap-size);
		padding: 0 var(--space-m);
		color: var(--color-fg);
		text-decoration: none;
	}
	ul a span {
		flex: 1;
	}
	ul a small {
		color: var(--color-muted);
	}
	ul a:not([data-done]) small {
		color: var(--color-accent);
		font-weight: var(--font-weight-strong);
	}
	ul a[data-done] :global(jl-icon) {
		color: var(--color-ok);
	}
	menu {
		gap: var(--space-s);
	}
</style>
