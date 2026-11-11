<script>
	import config from '#lib/data/config.json';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * How to show an organization's jobs on another website: a frame for any site, an element
	 * styled by the site, or a whole page of its own (jobs.your-domain). All stay up to date by
	 * themselves (embed/src/joblist-jobs.js): with its board (board="greenhouse:acme"), the
	 * visitor's browser reads it live, with no joblist and no index; with its domain only
	 * (company="acme.org"), an index says which board it has.
	 * @type {{attribute: 'board' | 'company', value: string, title: string}}
	 */
	let { attribute, value, title } = $props();
	const page = `${config.url}${config.embed.page}`;
	const scripts = `${config.url}${config.embed.scripts}`;
	const quoted = (/** @type {string} */ text) => text.replaceAll('"', '&quot;');
	const snippets = $derived([
		{
			id: 'iframe',
			code: `<iframe src="${page}?${attribute}=${encodeURIComponent(value).replaceAll('%3A', ':').replaceAll('%2F', '/')}" title="${quoted(title)}" width="100%" height="480" style="border:0"></iframe>`
		},
		{
			id: 'element',
			code: `<script type="module" src="${scripts}joblist-jobs.js"></${'script'}>\n<joblist-jobs ${attribute}="${quoted(value)}"></joblist-jobs>`
		},
		{
			id: 'page',
			intro: t('embed.page.intro'),
			code: [
				'<!doctype html>',
				'<html lang="en">',
				'<meta charset="utf-8">',
				'<meta name="viewport" content="width=device-width, initial-scale=1">',
				`<title>${title.replaceAll('<', '&lt;')}</title>`,
				'<style>body { max-width: 48rem; margin: auto; padding: 1rem; font-family: system-ui, sans-serif; }</style>',
				`<script type="module" src="${scripts}joblist-jobs.js"></${'script'}>`,
				`<joblist-jobs ${attribute}="${quoted(value)}" query="" where="" search limit="100"></joblist-jobs>`,
				'</html>'
			].join('\n')
		}
	]);
	let copied = $state('');

	/** @param {string} id @param {string} code */
	async function copy(id, code) {
		try {
			await navigator.clipboard.writeText(code);
			copied = id;
			setTimeout(() => (copied = ''), config.layout.copiedMs);
		} catch {
			// the code stays selectable
		}
	}
</script>

<jl-embed>
	<p><small>{t('embed.intro')}</small></p>
	{#each snippets as snippet (snippet.id)}
		<h3>{t(`embed.${snippet.id}`)}</h3>
		{#if 'intro' in snippet}<p><small>{snippet.intro}</small></p>{/if}
		<pre><code>{snippet.code}</code></pre>
		<button type="button" onclick={() => copy(snippet.id, snippet.code)}>{copied === snippet.id ? t('embed.copied') : t('embed.copy')}</button>
	{/each}
</jl-embed>

<style>
	jl-embed {
		display: block;
	}
	h3 {
		margin: var(--space-m) 0 var(--space-xs);
		font-size: var(--font-size-small);
	}
	pre {
		margin: 0 0 var(--space-xs);
		padding: var(--space-s);
		overflow-x: auto;
		border-radius: var(--radius);
		background: var(--color-soft);
		font-size: var(--font-size-small);
		white-space: pre-wrap;
		word-break: break-all;
	}
	button {
		min-height: var(--chip-height);
		padding: 0 var(--space-m);
		border-radius: var(--radius-round);
		font-size: var(--font-size-small);
	}
</style>
