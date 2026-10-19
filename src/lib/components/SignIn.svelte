<script>
	import { signIn } from '#lib/auth/session.svelte.js';
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
			required
		/>
		{#if error}<p role="alert">{error}</p>{/if}
		<menu><button type="submit" disabled={busy}>{t('signin.submit')}</button></menu>
	</form>
</jl-signin>
