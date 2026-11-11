<script>
	import config from '#lib/data/config.json';
	import { t } from '#lib/i18n/index.svelte.js';
</script>

<jl-footer>
	<footer>
		<p>
			<small>{t('about.data')} <a href={config.source}>{t('about.source')}</a></small>
		</p>
		<p>
			<small><a href="/apps">{t('menu.apps')}</a> · <a href="/menu">{t('nav.menu')}</a></small>
		</p>
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
		padding: var(--space-m) var(--gutter);
	}
	p {
		margin: 0;
	}
</style>
