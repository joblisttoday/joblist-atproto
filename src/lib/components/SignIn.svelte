<script>
	import config from '#lib/data/config.json';
	import { session, signIn } from '#lib/session.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Signing in with an atproto handle (an organization's: its domain): off to its account's
	 * server, then back (to `back`, else its own page).
	 * @type {{back?: string}}
	 */
	let { back = '' } = $props();
	const id = $props.id();
	let handle = $state('');
	let going = $state(false);
	let error = $state('');

	/** @param {SubmitEvent} event */
	async function submit(event) {
		event.preventDefault();
		going = true;
		error = '';
		try {
			await signIn(handle, back);
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
			going = false;
		}
	}
</script>

<form onsubmit={submit}>
	<label for={id}>
		{t('signin.handle')}
		<input {id} bind:value={handle} type="text" placeholder={t('signin.placeholder')} autocomplete="username" autocapitalize="none" spellcheck="false" required />
	</label>
	<menu><button type="submit" disabled={going}>{going ? t('signin.going') : t('signin.submit')}</button></menu>
	{#if error || session.error}<p role="alert">{t('signin.failed', { error: error || session.error || '' })}</p>{/if}
	<p><small>{t('signin.noAccount')} <a href={config.links.signup} target="_blank" rel="noopener">{t('signin.create')}</a></small></p>
</form>
