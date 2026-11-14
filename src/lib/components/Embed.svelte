<script>
	import config from '#lib/data/config.json';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * An organization's jobs on its website: a line to paste, as a frame (any site) or an
	 * element (styled by the site). They stay up to date by themselves: the visitor's browser
	 * reads them from the organization's own account.
	 * @type {{domain: string}}
	 */
	let { domain } = $props();
	const snippets = $derived([
		{ id: 'iframe', code: `<iframe src="${config.url}${config.embed.page}/?organization=${domain}" title="${t('embed.title', { name: domain })}" width="100%" height="480" style="border:0"></iframe>` },
		{ id: 'element', code: `<script type="module" src="${config.url}${config.embed.scripts}joblist-jobs.js"></${'script'}>\n<joblist-jobs organization="${domain}"></joblist-jobs>` }
	]);
	let copied = $state('');

	/** @param {string} id @param {string} code */
	async function copy(id, code) {
		try {
			await navigator.clipboard.writeText(code);
			copied = id;
			setTimeout(() => (copied = ''), 3000);
		} catch {
			// the code stays there to select
		}
	}
</script>

<p>{t('embed.intro')}</p>
{#each snippets as snippet (snippet.id)}
	<h2>{t(`embed.${snippet.id}`)}</h2>
	<pre><code>{snippet.code}</code></pre>
	<menu><button type="button" onclick={() => copy(snippet.id, snippet.code)}>{copied === snippet.id ? t('embed.copied') : t('embed.copy')}</button></menu>
{/each}

<style>
	h2 {
		font-size: var(--font-size);
	}
	pre {
		margin: 0 0 var(--space-s);
		padding: var(--space-s) var(--space-m);
		overflow-x: auto;
		border-radius: var(--radius);
		background: var(--color-soft);
		font-size: var(--font-size-small);
		white-space: pre-wrap;
		word-break: break-all;
	}
</style>
