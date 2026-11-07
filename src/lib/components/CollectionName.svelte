<script>
	import config from '#lib/data/config.json';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * A collection's name, to create one or rename it.
	 * @type {{value?: string, submit: string, onsubmit: (name: string) => void, oncancel?: () => void}}
	 *   submit: the button's text
	 */
	let { value = '', submit, onsubmit, oncancel } = $props();
	const id = $props.id();
	// The name being typed starts from the current one.
	// svelte-ignore state_referenced_locally
	let name = $state(value);

	/** @param {SubmitEvent} event */
	function send(event) {
		event.preventDefault();
		if (!name.trim()) return;
		onsubmit(name);
		name = '';
	}
</script>

<jl-collection-name>
	<form onsubmit={send}>
		<label for="{id}-name">{t('collections.name')}</label>
		<input
			id="{id}-name"
			bind:value={name}
			required
			maxlength={config.jobCollections.nameMax}
			placeholder={t('collections.name.placeholder')}
			autocomplete="off"
			enterkeyhint="done"
		/>
		<menu>
			<button type="submit">{submit}</button>
			{#if oncancel}<button type="button" onclick={oncancel}>{t('form.cancel')}</button>{/if}
		</menu>
	</form>
</jl-collection-name>

<style>
	jl-collection-name {
		display: block;
	}
	menu {
		margin-top: var(--space-s);
	}
</style>
