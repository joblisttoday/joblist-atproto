<script>
	import { goto } from '$app/navigation';
	import { t } from '#lib/i18n/index.svelte.js';

	/** @type {{value?: string, list?: string}} the list to go back to, kept across pastes */
	let { value = '', list = '' } = $props();

	// Reading the clipboard needs a user gesture and is not offered everywhere.
	const canPaste = typeof navigator !== 'undefined' && Boolean(navigator.clipboard?.readText);

	async function paste() {
		try {
			const text = (await navigator.clipboard.readText()).trim();
			if (text) await goto(`/add?${new URLSearchParams(list ? { url: text, list } : { url: text })}`);
		} catch {
			// permission refused: the field still takes a normal paste
		}
	}
</script>

<jl-add-link>
	<!-- A plain GET form: the query is the state, so sign-in and reloads keep it. -->
	<form action="/add" method="GET">
		<label for="add-url">{t('add.link')}</label>
		<input
			id="add-url"
			name="url"
			{value}
			type="text"
			inputmode="url"
			autocapitalize="none"
			autocomplete="url"
			spellcheck="false"
			enterkeyhint="go"
			placeholder={t('add.link.placeholder')}
			required
			aria-describedby="add-url-help"
		/>
		{#if list}<input type="hidden" name="list" value={list} />{/if}
		<small id="add-url-help">{t('add.link.help')}</small>
		<menu>
			<button type="submit">{t('add.continue')}</button>
			{#if canPaste}<button type="button" onclick={paste}>{t('add.paste')}</button>{/if}
		</menu>
	</form>
</jl-add-link>
