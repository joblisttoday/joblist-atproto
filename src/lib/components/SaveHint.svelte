<script>
	import { session } from '#lib/auth/session.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';
</script>

<!-- Signed out, by the save button: saving will ask to sign in, and nothing written is lost. -->
{#if session.ready && !session.did}
	<p><small>{t('save.signin.hint')}</small></p>
{/if}

<style>
	p {
		margin: var(--space-m) 0 0;
	}
</style>
