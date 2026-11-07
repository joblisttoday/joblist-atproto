<script>
	import Icon from './Icon.svelte';
	import { session } from '#lib/auth/session.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Who the offer will be shown as posted by: the company itself when the
	 * signed-in handle is its domain, otherwise shared by this person (once signed in).
	 * @type {{company: string}}
	 */
	let { company } = $props();
	const verified = $derived(session.handle === company);
</script>

<jl-job-poster verified={verified || undefined}>
	{#if verified}
		<p><Icon name="verified" /> {t('post.as.company')}</p>
	{:else}
		<p>{session.handle ? t('post.as.shared', { handle: session.handle }) : t('post.as.signedOut')}</p>
		<small>{t('post.as.shared.help', { domain: company })}</small>
	{/if}
</jl-job-poster>

<style>
	jl-job-poster {
		display: block;
		margin: var(--space-m) 0;
		padding: var(--space-s) var(--space-m);
		border-radius: var(--radius);
		background: var(--color-soft);
	}
	jl-job-poster[verified] p {
		color: var(--color-ok);
	}
	p {
		margin: 0;
	}
</style>
