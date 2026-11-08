<script>
	import MenuPage from '#lib/components/MenuPage.svelte';
	import OutboxList from '#lib/components/OutboxList.svelte';
	import { t } from '#lib/i18n/index.svelte.js';
</script>

<MenuPage title={t('outbox.title')} intro={t('outbox.intro')}>
	<OutboxList />
</MenuPage>
