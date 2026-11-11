<script>
	import Icon from './Icon.svelte';
	import config from '#lib/data/config.json';
	import { keep, kept } from '#lib/network/kept.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Keep an organization by any link: its website, its job board, a social profile, a group.
	 * Kept in this browser only (kept.svelte.js).
	 */
	const id = $props.id();
	let link = $state('');
	let name = $state('');
	let error = $state('');

	/** @param {SubmitEvent} event */
	function submit(event) {
		event.preventDefault();
		error = '';
		if (!link.trim()) return;
		if (!keep(link, name)) {
			error = kept.list.length >= config.kept.max ? t('kept.full', { max: config.kept.max }) : t('kept.invalid');
			return;
		}
		link = '';
		name = '';
	}
</script>

<jl-keep-form>
	<form onsubmit={submit}>
		<jl-keep-field>
			<label for="{id}-link">{t('kept.link')}</label>
			<input id="{id}-link" type="text" inputmode="url" autocapitalize="none" spellcheck="false" bind:value={link} placeholder={t('kept.link.example')} aria-invalid={error ? 'true' : undefined} aria-describedby={error ? `${id}-error` : undefined} />
		</jl-keep-field>
		<jl-keep-field>
			<label for="{id}-name">{t('kept.name')}</label>
			<input id="{id}-name" type="text" bind:value={name} maxlength="200" />
		</jl-keep-field>
		<button type="submit"><Icon name="save" /> {t('kept.keep')}</button>
		{#if error}<p id="{id}-error" role="alert">{error}</p>{/if}
	</form>
</jl-keep-form>

<style>
	form {
		display: grid;
		gap: var(--space-s);
	}
	jl-keep-field {
		display: grid;
		gap: var(--space-xs);
	}
	label {
		font-size: var(--font-size-small);
		color: var(--color-muted);
	}
	button {
		justify-self: start;
	}
	[role='alert'] {
		margin: 0;
		color: var(--color-error);
		font-size: var(--font-size-small);
	}
	/* Wide screens: link, name and Keep on one row. */
	@media (min-width: 48rem) {
		form {
			grid-template-columns: 2fr 1fr auto;
			align-items: end;
		}
		[role='alert'] {
			grid-column: 1 / -1;
		}
	}
</style>
