<script>
	import config from '#lib/data/config.json';
	import MenuPage from '#lib/components/MenuPage.svelte';
	import { i18n, setLocale, t } from '#lib/i18n/index.svelte.js';

	// Each language named in itself, one tap each.
</script>

<MenuPage title={t('about.language')} intro={t('menu.language.intro')}>
	<fieldset>
		<legend>{t('about.language')}</legend>
		{#each config.locales as locale (locale)}
			<label lang={locale}>
				<input type="radio" name="locale" value={locale} checked={i18n.locale === locale} onchange={() => setLocale(locale)} />
				<span>{t(`locale.${locale}`)}</span>
			</label>
		{/each}
	</fieldset>
</MenuPage>

<style>
	fieldset {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-xs);
		margin-top: var(--space-m);
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
</style>
