<script>
	import config from '#lib/data/config.json';
	import { session, signIn } from '#lib/auth/session.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	let handle = $state('');
	let busy = $state(false);
	/** @type {string | null} */
	let error = $state(null);

	/** @param {SubmitEvent} event */
	async function submit(event) {
		event.preventDefault();
		busy = true;
		error = null;
		try {
			await signIn(handle);
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
			busy = false;
		}
	}
</script>

<jl-signin>
	<form onsubmit={submit}>
		<label for="handle">{t('signin.handle')}</label>
		<input
			id="handle"
			bind:value={handle}
			placeholder={t('signin.placeholder')}
			autocomplete="username"
			autocapitalize="none"
			spellcheck="false"
			inputmode="url"
			enterkeyhint="go"
			required
			aria-describedby="handle-help"
		/>
		<small id="handle-help">{t('signin.help')}</small>
		{#if error || session.error}<p role="alert">{t('signin.error')} <small>{error || session.error}</small></p>{/if}
		<menu><button type="submit" disabled={busy}>{busy ? t('signin.busy') : t('signin.submit')}</button></menu>
		<p>
			<small>{t('signin.noAccount')} <a href={config.links.signup} target="_blank" rel="noopener">{t('signin.create')} ↗</a></small>
		</p>
	</form>
</jl-signin>

<style>
	menu button {
		width: 100%;
	}
</style>
