<script>
	import Icon from './Icon.svelte';
	import config from '#lib/data/config.json';
	import { tick } from 'svelte';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Ways to take part besides a job (volunteer, join, fund, contribute), one row each:
	 * what kind, where, and in a few words what it is.
	 * @type {{contribute: import('#lib/models/company.js').CompanyForm['contribute']}}
	 */
	let { contribute = $bindable() } = $props();
	const id = $props.id();
	const { contributeKinds, contributeMax, contributeTextMax } = config.companyForm;

	async function add() {
		contribute.push({ kind: contributeKinds[0], text: '', url: '' });
		await tick();
		document.getElementById(`${id}-${contribute.length - 1}-url`)?.focus();
	}
</script>

<jl-contribute-fields>
	<fieldset aria-describedby="{id}-help">
		<legend>{t('form.contribute')}</legend>
		<small id="{id}-help">{t('form.contribute.help')}</small>
		<ol>
			{#each contribute as way, i (i)}
				<li>
					<label for="{id}-{i}-kind">{t('form.contribute.kind', { number: i + 1 })}</label>
					<select id="{id}-{i}-kind" bind:value={way.kind}>
						{#each contributeKinds as kind (kind)}<option value={kind}>{t(`contribute.${kind}`)}</option>{/each}
					</select>
					<label for="{id}-{i}-url">{t('form.contribute.url', { number: i + 1 })}</label>
					<input id="{id}-{i}-url" bind:value={way.url} type="text" inputmode="url" autocapitalize="none" spellcheck="false" placeholder="https://" />
					<button type="button" onclick={() => contribute.splice(i, 1)}>
						<Icon name="close" label={t('form.contribute.remove', { number: i + 1 })} />
					</button>
					<label for="{id}-{i}-text">{t('form.contribute.text', { number: i + 1 })}</label>
					<input id="{id}-{i}-text" bind:value={way.text} type="text" maxlength={contributeTextMax} placeholder={t('form.contribute.placeholder')} />
				</li>
			{/each}
		</ol>
		{#if contribute.length < contributeMax}
			<button type="button" onclick={add}><Icon name="add" /> {t('form.contribute.add')}</button>
		{/if}
	</fieldset>
</jl-contribute-fields>

<style>
	label {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
	}
	/* What kind and where on one line, what it is under them. */
	li {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		gap: var(--space-xs);
		margin-top: var(--space-s);
	}
	li + li {
		margin-top: var(--space-m);
	}
	li > input:last-child {
		grid-column: 1 / 3;
	}
	li > button {
		min-width: var(--tap-size);
		padding: 0;
		border: 0;
		background: none;
		color: var(--color-muted);
	}
	fieldset > button {
		margin-top: var(--space-s);
		min-height: var(--chip-height);
		border-radius: var(--radius-round);
		font-size: var(--font-size-small);
	}
</style>
