<script>
	import { session } from '#lib/auth/session.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Where candidates apply: a link or an email, and/or a Bluesky message to
	 * the poster. joblist only shows these; it never receives applications.
	 * @type {{applyTo: string, bluesky: boolean, missing: boolean, params: Record<string, string>}}
	 */
	let { applyTo = $bindable(), bluesky = $bindable(), missing, params } = $props();
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
		/>
		<label>
			<input type="checkbox" name="bluesky" toolparamdescription={params.bluesky} bind:checked={bluesky} />
			{t('post.bluesky', { handle: session.handle || '' })}
		</label>
		{#if missing}<p role="alert">{t('post.apply.missing')}</p>{/if}
	</fieldset>
</jl-job-apply-fields>

<style>
	p {
		margin: var(--space-s) 0 0;
	}
</style>
