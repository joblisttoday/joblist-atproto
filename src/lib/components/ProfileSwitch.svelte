<script>
	import { forgetProfile } from '#lib/auth/session.svelte.js';
	import { FIRST, addProfile, currentProfile, profiles, renameProfile, useProfile } from '#lib/profiles/profiles.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Which profile this browser uses (profiles.js): each keeps its own saved jobs,
	 * searches and drafts, and maybe an account. Switching reloads the page in it.
	 */
	const id = $props.id();
	const { list } = profiles();
	const current = currentProfile();
	let name = $state('');
	let rename = $state(current.name);

	/** @param {import('#lib/profiles/profiles.js').Profile} p */
	const label = (p) => p.name || t('profiles.first');

	/** @param {Event} event */
	function add(event) {
		event.preventDefault();
		if (!name.trim()) return;
		addProfile(name);
		location.reload();
	}

	/** @param {Event} event */
	function save(event) {
		event.preventDefault();
		renameProfile(current.id, rename);
		location.reload();
	}

	async function remove() {
		await forgetProfile(current.id);
		location.reload();
	}
</script>

<jl-profile-switch>
	<p>
		<label for="{id}-use">{t('profiles.label')}</label>
		<select id="{id}-use" value={current.id} onchange={(e) => (useProfile(e.currentTarget.value), location.reload())}>
			{#each list as p (p.id)}<option value={p.id}>{label(p)}</option>{/each}
		</select>
	</p>
	<details>
		<summary>{t('profiles.manage')}</summary>
		<p><small>{t('profiles.about')}</small></p>
		<form onsubmit={add}>
			<label for="{id}-new">{t('profiles.new')}</label>
			<input id="{id}-new" bind:value={name} maxlength="60" placeholder={t('profiles.new.example')} />
			<button type="submit">{t('profiles.create')}</button>
		</form>
		<form onsubmit={save}>
			<label for="{id}-name">{t('profiles.rename', { name: label(current) })}</label>
			<input id="{id}-name" bind:value={rename} maxlength="60" />
			<button type="submit">{t('profiles.save')}</button>
		</form>
		{#if current.id !== FIRST}
			<details>
				<summary>{t('profiles.remove', { name: label(current) })}</summary>
				<p><small>{t('profiles.remove.about')}</small></p>
				<button type="button" onclick={remove}>{t('profiles.remove.confirm')}</button>
			</details>
		{/if}
	</details>
</jl-profile-switch>

<style>
	jl-profile-switch {
		display: block;
		margin-block: var(--space-s);
	}
	p {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-s);
		margin: 0 0 var(--space-xs);
	}
	summary {
		padding-block: var(--space-s);
		cursor: pointer;
		font-size: var(--font-size-small);
	}
	form {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: var(--space-xs) var(--space-s);
		margin-bottom: var(--space-m);
	}
	form label {
		grid-column: 1 / -1;
	}
	details details {
		margin-top: var(--space-s);
	}
	small {
		color: var(--color-muted);
	}
</style>
