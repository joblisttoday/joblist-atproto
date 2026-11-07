<script>
	import Icon from './Icon.svelte';
	import config from '#lib/data/config.json';
	import { addTags, popularTags, splitTags } from '#lib/models/company-form.js';
	import { data } from '#lib/network/network.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Tags as chips: typed and finished with Enter or a comma, removed with ×,
	 * or picked from the tags other companies use most.
	 * @type {{tags: string[], tool?: string}}
	 */
	let { tags = $bindable(), tool } = $props();
	const id = $props.id();
	const { tagsMax, tagSuggestions } = config.companyForm;
	let text = $state('');
	const full = $derived(tags.length >= tagsMax);
	const suggested = $derived(full ? [] : popularTags(data.companies.values(), tags, text, tagSuggestions));

	/**
	 * Tags finished with a comma (also when pasted, or filled in by an assistant).
	 * @param {Event & {currentTarget: HTMLInputElement}} event
	 */
	function oninput(event) {
		const { done, rest } = splitTags(event.currentTarget.value);
		if (done.length) tags = addTags(tags, done);
		text = event.currentTarget.value = rest;
	}

	/** Whatever is still typed becomes a tag. */
	function commit() {
		if (text.trim()) tags = addTags(tags, [text]);
		text = '';
	}

	/** @param {KeyboardEvent} event */
	function onkeydown(event) {
		if (event.key === 'Enter') {
			event.preventDefault();
			commit();
		} else if (event.key === 'Backspace' && !text && tags.length) {
			tags = tags.slice(0, -1);
		}
	}

	/** @param {string} tag */
	function pick(tag) {
		tags = addTags(tags, [tag]);
		text = '';
		document.getElementById(`${id}-input`)?.focus();
	}
</script>

<jl-tag-input full={full || undefined}>
	<label for="{id}-input">{t('form.tags')}</label>
	{#if tags.length}
		<ul aria-label={t('form.tags.chosen')}>
			{#each tags as tag (tag)}
				<li>
					{tag}
					<button type="button" onclick={() => (tags = tags.filter((x) => x !== tag))}>
						<Icon name="close" label={t('form.tags.remove', { tag })} />
					</button>
				</li>
			{/each}
		</ul>
	{/if}
	<input
		id="{id}-input"
		name="tags"
		toolparamdescription={tool}
		value={text}
		{oninput}
		{onkeydown}
		onblur={commit}
		disabled={full}
		autocapitalize="none"
		autocomplete="off"
		enterkeyhint="enter"
		placeholder={t('form.tags.placeholder')}
		aria-describedby="{id}-help"
	/>
	<small id="{id}-help">{full ? t('form.tags.full', { count: tagsMax }) : t('form.tags.help')}</small>
	{#if suggested.length}
		<p><small>{text.trim() ? t('form.tags.matching') : t('form.tags.popular')}</small></p>
		<menu aria-label={t('form.tags.suggested')}>
			{#each suggested as { tag, count } (tag)}
				<li><button type="button" onclick={() => pick(tag)}><Icon name="add" /> {tag} <small>{count}</small></button></li>
			{/each}
		</menu>
	{/if}
</jl-tag-input>

<style>
	jl-tag-input {
		display: block;
	}
	ul,
	menu {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-xs);
		margin: 0 0 var(--space-xs);
	}
	ul li {
		display: inline-flex;
		align-items: center;
		min-height: var(--chip-height);
		padding-inline-start: var(--space-m);
		border-radius: var(--radius-round);
		background: var(--color-fg);
		color: var(--color-bg);
		font-size: var(--font-size-small);
	}
	ul button {
		min-height: var(--chip-height);
		min-width: var(--chip-height);
		padding: 0 var(--space-s);
		border: 0;
		border-radius: var(--radius-round);
		background: none;
		color: inherit;
	}
	ul button:hover:not(:disabled) {
		background: none;
		opacity: 0.7;
	}
	p {
		margin: var(--space-s) 0 var(--space-xs);
	}
	menu button {
		min-height: var(--chip-height);
		padding: 0 var(--space-m);
		border-radius: var(--radius-round);
		font-size: var(--font-size-small);
	}
	menu button small {
		font-size: inherit;
	}
</style>
