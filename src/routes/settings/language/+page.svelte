<script>
	import config from '#lib/data/config.json';
	import SettingsHeader from '#lib/components/SettingsHeader.svelte';
	import { i18n, setLocale, t } from '#lib/i18n/index.svelte.js';

	/** The language (/settings/language): each named in itself, one tap each. */
</script>

<svelte:head><title>{t('settings.language')} · {config.name}</title></svelte:head>

<SettingsHeader title={t('settings.language')} />
<fieldset>
	<legend>{t('settings.language')}</legend>
	{#each config.locales as locale (locale)}
		<label lang={locale}>
			<input type="radio" name="locale" value={locale} checked={i18n.locale === locale} onchange={() => setLocale(locale)} />
			{new Intl.DisplayNames([locale], { type: 'language' }).of(locale)}
		</label>
	{/each}
</fieldset>

<style>
	fieldset {
		display: flex;
		flex-direction: column;
		gap: var(--space-xs);
		margin: 0;
		padding: 0;
		border: 0;
	}
	legend {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
	}
	label {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: var(--space-s);
		min-height: var(--tap-size);
		font-weight: normal;
	}
	input {
		width: 1.25rem;
		height: 1.25rem;
		min-height: 0;
		margin: 0;
		accent-color: var(--color-accent);
	}
</style>
