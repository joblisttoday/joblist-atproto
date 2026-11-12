<script>
	import config from '#lib/data/config.json';
	import Icon from '#lib/components/Icon.svelte';
	import CompanyDelete from '#lib/components/CompanyDelete.svelte';
	import { ownOrganization as org } from '#lib/network/own-organization.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Its page, as visitors see it at /{domain}: each part done or not, each edited alone
	 * (/add?field=…), all of it at once, or its description deleted.
	 */
	const fields = /** @type {const} */ (['description', 'jobBoard', 'locations', 'tags']);
</script>

<svelte:head><title>{t('orgs.page')} · {config.name}</title></svelte:head>

<h1>{t('orgs.page')}</h1>
{#if org.company}
	<p><a href="/{org.own}">{t('orgs.view')} <Icon name="next" /></a></p>
	<ul>
		{#each fields as field (field)}
			{@const done = !org.missing.includes(field)}
			<li>
				<a href="/add?key={encodeURIComponent(org.own)}&field={field}" data-done={done || undefined}>
					<Icon name={done ? 'added' : 'add'} />
					<span>{t(`orgs.field.${field}`)}</span>
					<small>{done ? t('company.edit') : t('orgs.field.add')}</small>
				</a>
			</li>
		{/each}
	</ul>
	<menu>
		<a href="/add">{t('orgs.editAll')}</a>
		<CompanyDelete company={org.company} />
	</menu>
{:else}
	<p>{t('orgs.none')}</p>
	<menu><a href="/add" data-primary><Icon name="add" /> {t('orgs.describe')}</a></menu>
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
