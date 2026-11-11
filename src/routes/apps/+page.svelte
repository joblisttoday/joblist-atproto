<script>
	import config from '#lib/data/config.json';
	import manifest from '../../../extension/manifest.json';
	import AddAnywhere from '#lib/components/AddAnywhere.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import PageHeader from '#lib/components/PageHeader.svelte';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * joblist outside this site: the Firefox add-on (built with each deploy, packed as a zip
	 * by scripts/build-extension.js: tried as a temporary add-on until it is signed by Mozilla),
	 * and the ways to send a page to joblist from anywhere (share, bookmarklet, assistants).
	 */
	const file = '/apps/joblist-firefox.zip';
	const debugging = 'about:debugging#/runtime/this-firefox';
	let copied = $state(false);

	async function copy() {
		try {
			await navigator.clipboard.writeText(debugging);
			copied = true;
			setTimeout(() => (copied = false), config.layout.copiedMs);
		} catch {
			// the address stays shown, to type
		}
	}
</script>

<svelte:head><title>{t('apps.title')} · {config.name}</title></svelte:head>

<jl-apps>
	<PageHeader title={t('apps.title')} intro={t('apps.intro')} />

	<section aria-labelledby="apps-firefox">
		<h2 id="apps-firefox">{t('apps.firefox.title')}</h2>
		<p>{t('apps.firefox.text')}</p>
		<ul>
			<li>{t('apps.firefox.known')}</li>
			<li>{t('apps.firefox.links')}</li>
			<li>{t('apps.firefox.save')}</li>
		</ul>
		<menu><a href={file} download data-primary><Icon name="down" /> {t('apps.firefox.download')}</a></menu>
		<p><small>{t('apps.firefox.version', { version: manifest.version })}</small></p>

		<h3>{t('apps.firefox.try')}</h3>
		<ol>
			<li>{t('apps.firefox.step1')}</li>
			<li>
				{t('apps.firefox.step2')}
				<code>{debugging}</code>
				<button type="button" onclick={copy}><Icon name="copy" /> {copied ? t('apps.copied') : t('apps.copy')}</button>
			</li>
			<li>{t('apps.firefox.step3')}</li>
			<li>{t('apps.firefox.step4')}</li>
		</ol>
		<p><small>{t('apps.firefox.temporary')}</small></p>
	</section>

	<AddAnywhere open />
</jl-apps>

<style>
	jl-apps {
		display: block;
		max-width: var(--reading-width);
		margin-inline: auto;
		padding-bottom: var(--space-xl);
	}
	section {
		margin-top: var(--space-m);
	}
	ul,
	ol {
		padding-inline-start: var(--space-l);
	}
	ul {
		list-style: disc;
	}
	ol {
		list-style: decimal;
	}
	li + li {
		margin-top: var(--space-xs);
	}
	small {
		color: var(--color-muted);
	}
	code {
		display: inline-block;
		margin: var(--space-xxs) var(--space-xs) var(--space-xxs) 0;
		padding: 0 var(--space-xs);
		border-radius: var(--radius);
		background: var(--color-soft);
		overflow-wrap: anywhere;
	}
	button {
		min-height: var(--chip-height);
		padding: 0 var(--space-s);
		font-size: var(--font-size-small);
	}
	[data-primary] {
		background: var(--color-accent);
		color: var(--color-accent-fg);
		border-color: var(--color-accent);
	}
</style>
