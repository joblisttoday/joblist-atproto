<script>
	import config from '#lib/data/config.json';
	import Icon from './Icon.svelte';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Once a list is made: that it is there, and what to do next with it.
	 * Empty (made from its name only): how organizations come in, as one browses.
	 * @type {{path: string, name: string, count: number, local?: boolean, link?: string | null}} path: the list's page;
	 *   count: its companies; local: kept on this device; link: what sharing gives (a private list: the link that carries it)
	 */
	let { path, name, count, local = false, link = path } = $props();
	let copied = $state(false);

	async function share() {
		const url = window.location.origin + link;
		if (navigator.share) {
			await navigator.share({ title: name, url }).catch(() => {});
		} else {
			await navigator.clipboard.writeText(url);
			copied = true;
			setTimeout(() => (copied = false), config.layout.copiedMs);
		}
	}
</script>

<jl-list-saved>
	<h1 tabindex="-1"><Icon name="applied" /> {t('form.list.saved', { name })}</h1>
	{#if count}
		<p>{t(local ? 'form.list.saved.local' : 'form.list.saved.text', { count })}</p>
	{:else}
		<p>{t('form.list.saved.empty')}</p>
	{/if}
	<menu>
		{#if count}
			<a href={path}><Icon name="jobs" /> {t('form.list.saved.jobs')}</a>
		{:else}
			<a href="/companies"><Icon name="companies" /> {t('form.list.saved.browse')}</a>
		{/if}
		{#if count && link}<button type="button" onclick={share}><Icon name={copied ? 'added' : 'share'} /> {copied ? t('list.linkCopied') : t('form.list.saved.share')}</button>{/if}
		<a href="{path}/edit" data-add><Icon name="add" /> {t(count ? 'form.list.saved.more' : 'form.list.add')}</a>
	</menu>
	<p><small><a href="/lists/new">{t('form.list.saved.another')}</a></small></p>
</jl-list-saved>

<style>
	jl-list-saved {
		display: block;
	}
	h1 {
		display: flex;
		align-items: center;
		gap: var(--space-s);
	}
	h1 :global(jl-icon) {
		color: var(--color-ok);
	}
	h1:focus {
		outline: none;
	}
	menu > a:first-child {
		background: var(--color-accent);
		color: var(--color-accent-fg);
		border-color: var(--color-accent);
	}
</style>
