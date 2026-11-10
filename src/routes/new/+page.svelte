<script>
	import config from '#lib/data/config.json';
	import MenuLinks from '#lib/components/MenuLinks.svelte';
	import PageHeader from '#lib/components/PageHeader.svelte';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * What one can add, each on its own page: published from one's account (a job, an
	 * organization), or kept private first (a list).
	 */
	/** @type {import('#lib/navigation/nav.js').MenuLink[]} */
	const publish = $derived([
		{ href: '/jobs/new', icon: 'post', label: t('nav.post') },
		{ href: '/add', icon: 'companies', label: t('form.company.title') }
	]);
	/** @type {import('#lib/navigation/nav.js').MenuLink[]} */
	const lists = $derived([
		{ href: '/me/lists#new', icon: 'jobs', label: t('collections.new') }
	]);
</script>

<svelte:head><title>{t('nav.add')} · {config.name}</title></svelte:head>

<jl-new>
	<PageHeader title={t('nav.add')} />
	<MenuLinks label={t('new.publish')} items={publish} />
	<MenuLinks label={t('new.lists')} items={lists} />
</jl-new>

<style>
	jl-new {
		display: block;
		max-width: var(--reading-width);
		margin-inline: auto;
		padding-bottom: var(--space-xl);
	}
</style>
