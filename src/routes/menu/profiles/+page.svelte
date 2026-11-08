<script>
	import MenuPage from '#lib/components/MenuPage.svelte';
	import ProfileSwitch from '#lib/components/ProfileSwitch.svelte';
	import { t } from '#lib/i18n/index.svelte.js';
</script>

<MenuPage title={t('profiles.label')}>
	<ProfileSwitch />
</MenuPage>
