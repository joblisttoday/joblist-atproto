<script>
	import Icon from './Icon.svelte';
	import config from '#lib/data/config.json';
	import { i18n, setLocale, t } from '#lib/i18n/index.svelte.js';

	/**
	 * The site's language, wherever it is offered (the header, the account, the footer):
	 * each language named in itself, and marked as written in it.
	 * compact: only its icon and the language (the header).
	 * @type {{compact?: boolean}}
	 */
	let { compact = false } = $props();
</script>

<jl-locale-switch compact={compact || undefined}>
	<label>
		<Icon name="language" />
		<span>{t('about.language')}</span>
		<select value={i18n.locale} onchange={(e) => setLocale(e.currentTarget.value)}>
			{#each config.locales as locale (locale)}<option value={locale} lang={locale}>{t(`locale.${locale}`)}</option>{/each}
		</select>
	</label>
</jl-locale-switch>

<style>
	jl-locale-switch {
		display: block;
	}
	label {
		display: flex;
		align-items: center;
		gap: var(--space-s);
		margin: 0;
		font-weight: normal;
		color: var(--color-muted);
		font-size: var(--font-size-small);
	}
	select {
		width: auto;
		color: var(--color-fg);
	}
	/* The header: the icon says it, the name is for screen readers. */
	jl-locale-switch[compact] span {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	jl-locale-switch[compact] label {
		gap: var(--space-xs);
	}
	jl-locale-switch[compact] select {
		min-height: var(--chip-height);
		padding-block: 0;
		border: 0;
		background: none;
		color: var(--color-muted);
	}
</style>
