<script>
	import Icon from './Icon.svelte';
	import links from '#lib/data/elsewhere.json';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * A page that is not there (or could not be shown): what happened, a search of the jobs,
	 * and the main pages to go on from.
	 * @type {{title: string, text: string}}
	 */
	let { title, text } = $props();
	const items = links.map((link) => ({ ...link, icon: /** @type {import('#lib/icons.js').IconName} */ (link.icon) }));
</script>

<jl-not-found>
	<h1>{title}</h1>
	<p>{text}</p>
	<p>{t('notFound.search')}</p>
	<!-- The jobs explorer reads its search from the address (q). -->
	<form role="search" action="/" method="get">
		<input type="search" name="q" placeholder={t('explore.what')} aria-label={t('jobs.filter.what')} enterkeyhint="search" />
		<button type="submit"><Icon name="search" /> {t('quick.label')}</button>
	</form>
	<nav aria-label={t('error.links')}>
		<menu>
			{#each items as link (link.href)}
				<li><a href={link.href}><Icon name={link.icon} /> {t(link.label)}</a></li>
			{/each}
		</menu>
	</nav>
</jl-not-found>

<style>
	jl-not-found {
		display: block;
		max-width: var(--measure);
		padding-block: var(--space-l);
	}
	form {
		display: flex;
		gap: var(--space-s);
	}
	input {
		flex: 1;
		min-width: 0;
	}
	button {
		flex: none;
	}
</style>
