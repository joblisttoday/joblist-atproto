<script>
	import Icon from './Icon.svelte';
	import { readApplyTo } from '#lib/models/apply-to.js';
	import { session } from '#lib/auth/session.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Where candidates apply: a link or an email, and/or a Bluesky message to
	 * the poster. joblist only shows these; it never receives applications.
	 * @type {{applyTo: string, bluesky: boolean, missing: boolean, params: Record<string, string>}}
	 */
	let { applyTo = $bindable(), bluesky = $bindable(), missing, params } = $props();
	// Said back while typing: where applications will go.
	const read = $derived(readApplyTo(applyTo));
</script>

<jl-job-apply-fields missing={missing || undefined}>
	<fieldset aria-describedby="apply-help">
		<legend data-required>{t('post.apply')}</legend>
		<small id="apply-help">{t('post.apply.help')}</small>
		<label for="apply-to">{t('post.applyTo')}</label>
		<input
			id="apply-to"
			name="applyTo"
			toolparamdescription={params.applyTo}
			bind:value={applyTo}
			inputmode="email"
			autocapitalize="none"
			spellcheck="false"
			placeholder={t('post.applyTo.placeholder')}
			aria-describedby="apply-read"
		/>
		<small id="apply-read" aria-live="polite" data-read={read?.kind}>
			{#if read?.kind === 'email'}<Icon name="added" /> {t('post.applyTo.email', { to: read.to })}
			{:else if read?.kind === 'link'}<Icon name="added" /> {t('post.applyTo.link', { to: read.to })}
			{:else if read}{t('post.applyTo.unclear')}{/if}
		</small>
		<label>
			<input type="checkbox" name="bluesky" toolparamdescription={params.bluesky} bind:checked={bluesky} />
			{t('post.bluesky', { handle: session.handle || '' })}
		</label>
		{#if missing}<p role="alert">{t('post.apply.missing')}</p>{/if}
	</fieldset>
</jl-job-apply-fields>

<style>
	small[data-read='email'],
	small[data-read='link'] {
		color: var(--color-ok);
	}
	small[data-read='unclear'] {
		color: var(--color-error);
	}
	p {
		margin: var(--space-s) 0 0;
	}
</style>
