<script>
	import CollectionsTransfer from '#lib/components/CollectionsTransfer.svelte';
	import MenuPage from '#lib/components/MenuPage.svelte';
	import { t } from '#lib/i18n/index.svelte.js';
</script>

<MenuPage title={t('collections.transfer')}>
	<CollectionsTransfer />
</MenuPage>
