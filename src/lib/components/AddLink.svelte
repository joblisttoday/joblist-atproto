<script>
	import { goto } from '$app/navigation';
	import { t } from '#lib/i18n/index.svelte.js';

	/** @type {{value?: string, list?: string, next?: string}} where to go back to (a list, or posting a job), kept across pastes */
	let { value = '', list = '', next = '' } = $props();
	const back = $derived(Object.fromEntries(Object.entries({ list, next }).filter(([, v]) => v)));

	// Reading the clipboard needs a user gesture and is not offered everywhere.
	const canPaste = typeof navigator !== 'undefined' && Boolean(navigator.clipboard?.readText);

	async function paste() {
		try {
			const text = (await navigator.clipboard.readText()).trim();
			if (text) await goto(`/add?${new URLSearchParams({ url: text, ...back })}`);
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
		{#each Object.entries(back) as [name, v] (name)}<input type="hidden" {name} value={v} />{/each}
		<small id="add-url-help">{t('add.link.help')}</small>
		<menu>
			<button type="submit">{t('add.continue')}</button>
			{#if canPaste}<button type="button" onclick={paste}>{t('add.paste')}</button>{/if}
		</menu>
	</form>
</jl-add-link>
