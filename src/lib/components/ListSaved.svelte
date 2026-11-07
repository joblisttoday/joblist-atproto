<script>
	import config from '#lib/data/config.json';
	import Icon from './Icon.svelte';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Once a list is made: that it is there, and what to do next with it.
	 * @type {{path: string, name: string, count: number}} path: the list's page; count: its companies
	 */
	let { path, name, count } = $props();
	let copied = $state(false);

	async function share() {
		const url = window.location.origin + path;
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
	<p>{t('form.list.saved.text', { count })}</p>
	<menu>
		<a href={path}><Icon name="jobs" /> {t('form.list.saved.jobs')}</a>
		<button type="button" onclick={share}><Icon name={copied ? 'added' : 'share'} /> {copied ? t('list.linkCopied') : t('form.list.saved.share')}</button>
		<a href="{path}/edit" data-add><Icon name="add" /> {t('form.list.saved.more')}</a>
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
