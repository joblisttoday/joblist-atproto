<script>
	import Icon from './Icon.svelte';
	import config from '#lib/data/config.json';
	import { readWebsite } from '#lib/models/company-form.js';
	import { data } from '#lib/network/network.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * The company's website: its domain is the company's key, so the field says
	 * which page it makes, or that the company is already here.
	 * @type {{url: string, editing?: string, tool?: string}} editing: the key of the company edited
	 */
	let { url = $bindable(), editing = '', tool } = $props();
	const read = $derived(readWebsite(url, data.companies, editing));
	const existing = $derived(read.state === 'exists' ? data.companies.get(read.key) : undefined);
	const site = new URL(config.url).host;
</script>

<jl-website-field state={read.state}>
	<label for="url">{t('form.website')}</label>
	<input
		id="url"
		name="url"
		toolparamdescription={tool}
		bind:value={url}
		type="text"
		inputmode="url"
		autocapitalize="none"
		autocomplete="url"
		spellcheck="false"
		placeholder="https://"
		required={!editing}
		aria-invalid={read.state === 'invalid' || undefined}
		aria-describedby="url-help"
	/>
	<small id="url-help" aria-live="polite">
		{#if read.state === 'new'}
			<Icon name="added" /> {t('form.website.page')} <b>{site}/{read.key}</b>
		{:else if read.state === 'exists' && existing}
			{t('form.website.exists', { name: existing.name })}
			<a href="/{read.key}">{t('form.website.open')}</a> ·
			<a href="/org/page?all">{t('form.website.improve')}</a>
		{:else if read.state === 'invalid'}
			{t('form.website.invalid')}
		{:else if read.state === 'kept'}
			{t('form.website.kept')} <b>{site}/{read.key}</b>
		{:else}
			{t('form.website.help')}
		{/if}
	</small>
</jl-website-field>

<style>
	jl-website-field {
		display: block;
	}
	small {
		overflow-wrap: anywhere;
	}
	jl-website-field[state='new'] small {
		color: var(--color-ok);
	}
	jl-website-field[state='exists'] small {
		color: var(--color-warn);
	}
	jl-website-field[state='invalid'] small {
		color: var(--color-error);
	}
	b {
		font-weight: var(--font-weight-strong);
	}
</style>
