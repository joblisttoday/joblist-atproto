<script>
	import Icon from './Icon.svelte';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Once a company is saved: what happened, and what to do next with it.
	 * @type {{key: string, name: string, added: boolean}} added: a new company (not an edit)
	 */
	let { key, name, added } = $props();
	const title = $derived(added ? 'added.new' : 'added.own');
</script>

<jl-add-saved>
	<h1 tabindex="-1"><Icon name="applied" /> {t(title, { name })}</h1>
	<p>{t('added.own.text', { name })}</p>
	<menu>
		<a href="/{key}">{t('added.open', { name })}</a>
		<a href="/org/post?company={encodeURIComponent(key)}"><Icon name="post" /> {t('added.post')}</a>
	</menu>
	<p><small><a href="/org/page">{t('added.another')}</a></small></p>
</jl-add-saved>

<style>
	jl-add-saved {
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
