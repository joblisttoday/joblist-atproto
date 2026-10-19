<script>
	import config from '#lib/data/config.json';
	import revenue from '#lib/data/revenue.json';
	import { i18n, setLocale, t } from '#lib/i18n/index.svelte.js';
</script>

<jl-footer>
	<footer>
		<p>
			<small>{t('about.data')} <a href={config.source}>{t('about.source')}</a></small>
			{#if revenue.support.paymentLink}<small>· <a href="/support">{t('support.title')}</a></small>{/if}
		</p>
		<label>
			<small>{t('me.language')}</small>
			<select value={i18n.locale} onchange={(e) => setLocale(e.currentTarget.value)}>
				{#each config.locales as locale (locale)}<option value={locale}>{t(`locale.${locale}`)}</option>{/each}
			</select>
		</label>
	</footer>
</jl-footer>

<style>
	jl-footer {
		display: block;
		border-top: var(--border);
	}
	footer {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-s) var(--space-m);
		max-width: var(--page-width);
		margin: 0 auto;
		padding: var(--space-m);
	}
	p {
		margin: 0;
	}
	label {
		display: flex;
		align-items: center;
		gap: var(--space-s);
		margin: 0;
		font-weight: normal;
	}
	select {
		width: auto;
	}
</style>
