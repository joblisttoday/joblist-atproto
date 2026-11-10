<script>
	import config from '#lib/data/config.json';
	import webmcp from '#lib/data/webmcp.json';
	import ChoiceChips from './ChoiceChips.svelte';
	import ListCompanyOrder from './ListCompanyOrder.svelte';
	import ListCompanyPicker from './ListCompanyPicker.svelte';
	import ListItem from './ListItem.svelte';
	import SaveHint from './SaveHint.svelte';
	import SaveResumed from './SaveResumed.svelte';
	import SaveSignIn from './SaveSignIn.svelte';
	import { session } from '#lib/auth/session.svelte.js';
	import { saveList } from '#lib/network/save-list.js';
	import { LOCAL } from '#lib/models/list.js';
	import { clearListDraft, readListDraft, writeListDraft } from '#lib/network/list-draft.js';
	import { leftToSave } from '#lib/network/drafts.js';
	import { listDraftApplies, previewList, resumeDraft, toListForm } from '#lib/models/list-form.js';
	import { i18n, t } from '#lib/i18n/index.svelte.js';
	import { untrack } from 'svelte';

	/**
	 * Make a list of companies, or edit one of the signed-in person's lists.
	 * @type {{
	 *   list?: import('#lib/models/list.js').List | null,
	 *   initial?: import('#lib/models/list-form.js').ListStart,
	 *   onsaved: (saved: {rkey: string, name: string, added: boolean, local: boolean}) => void,
	 *   oncancel?: () => void
	 * }}
	 */
	let { list = null, initial = {}, onsaved, oncancel } = $props();

	// An edit starts from the list as it is (the page remounts the form for another one);
	// a new list from the draft kept in this browser, when it is the same list.
	const draft = untrack(() => (list ? null : readListDraft(toListForm(null))));
	let restored = $state(untrack(() => listDraftApplies(draft, initial)));
	let form = $state(untrack(() => (restored && draft ? resumeDraft(draft, initial) : toListForm(list, initial))));
	$effect(() => {
		if (!list) writeListDraft($state.snapshot(form));
	});
	function startOver() {
		clearListDraft();
		restored = false;
		form = toListForm(null, initial);
	}

	const { nameMax, descriptionMax } = config.listForm;
	// Private first: a new list is kept in this browser unless made public (published to the account);
	// a public list stays public (its page is shared). "Make public" opens the form at #public.
	let local = $state(untrack(() => (list ? list.did === LOCAL : true) && location.hash !== '#public'));
	const keepOptions = $derived([
		{ value: 'device', label: t('form.list.keep.device') },
		{ value: 'account', label: t('form.list.keep.account') }
	]);
	const preview = $derived(previewList({ ...form, open: !local && form.open }, local ? LOCAL : session.did || ''));
	const openOptions = $derived([
		{ value: 'open', label: t('form.list.open.yes') },
		{ value: 'closed', label: t('form.list.open.no') }
	]);
	let busy = $state(false);
	/** @type {string | null} */
	let error = $state(null);
	// WebMCP: an AI assistant may name and describe the list; the person picks companies and saves.
	const tool = webmcp.forms.list;
	/** @type {SaveSignIn | undefined} */
	let signin = $state();
	const submitLabel = $derived(list ? t('form.save') : t('form.list.submit'));
	// A new list starts from its name; its description, organizations and where it is kept are a tap away.
	let more = $state(false);
	const moreSummary = $derived(
		[t('list.companies', { count: form.companies.length }), local ? t('form.list.keep.device') : t('form.list.keep.account')].join(' · ')
	);

	/** @param {SubmitEvent} event */
	async function submit(event) {
		event.preventDefault();
		// Published while signed out: the list stays in this browser while signing in, then is saved from here.
		if (!local && !session.did) return signin?.ask();
		busy = true;
		error = null;
		try {
			const rkey = await saveList($state.snapshot(form), list, local);
			if (!list) clearListDraft();
			leftToSave(null);
			onsaved({ rkey, name: form.name.trim(), added: !list, local });
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
		} finally {
			busy = false;
		}
	}
</script>

{#snippet rest()}
	<label for="list-description">{t('form.list.description')}</label>
	<textarea
		id="list-description"
		name="description"
		toolparamdescription={tool.params.description}
		bind:value={form.description}
		maxlength={descriptionMax}
		placeholder={t('form.list.description.placeholder')}
		aria-describedby="list-description-help"
	></textarea>
	<small id="list-description-help">
		{t('form.list.description.help')}
		<data value={form.description.length}>{form.description.length.toLocaleString(i18n.locale)} / {descriptionMax.toLocaleString(i18n.locale)}</data>
	</small>

	{#if !list || list.did === LOCAL}
		<ChoiceChips
			name="keep"
			legend={t('form.list.keep')}
			options={keepOptions}
			bind:value={() => (local ? 'device' : 'account'), (value) => (local = value === 'device')}
			required
			help={t(local ? 'form.list.keep.device.help' : 'form.list.keep.account.help')}
		/>
	{/if}
	{#if !local}
		<ChoiceChips
			name="open"
			legend={t('form.list.open')}
			options={openOptions}
			bind:value={() => (form.open ? 'open' : 'closed'), (value) => (form.open = value === 'open')}
			required
			help={t(form.open ? 'form.list.open.yes.help' : 'form.list.open.no.help')}
		/>
	{/if}

	<fieldset>
		<legend>{t('form.list.companies')} <data value={form.companies.length}>{form.companies.length.toLocaleString(i18n.locale)}</data></legend>
		<ListCompanyPicker bind:companies={form.companies} />
		<ListCompanyOrder bind:companies={form.companies} />
	</fieldset>
{/snippet}

<jl-list-form editing={list ? true : undefined}>
	{#if list}
		<p><small>{t(list.did === LOCAL ? 'form.list.editing.local' : 'form.list.editing', { name: list.name })}</small></p>
	{/if}
	<form onsubmit={submit} toolname={tool.toolname} tooldescription={tool.tooldescription}>
		<!-- A name alone needs no word about the required fields. -->
		{#if list || more}<p><small data-required>{t('form.required')}</small></p>{/if}
		<jl-form-fields>
			<SaveResumed form="list" label={submitLabel} />
			{#if restored}
				<p><small>{t('form.list.draft')} <button type="button" onclick={startOver}>{t('form.list.draft.clear')}</button></small></p>
			{/if}

			<label for="list-name">{t('form.list.name')}</label>
			<input
				id="list-name"
				name="name"
				toolparamdescription={tool.params.name}
				bind:value={form.name}
				required
				maxlength={nameMax}
				placeholder={t('form.list.name.placeholder')}
				aria-describedby="list-name-help"
			/>
			<small id="list-name-help">{t('form.list.name.help')}</small>

			<!-- A new list: a name is enough; the rest when wanted (organizations also come as one browses). -->
			{#if list}
				{@render rest()}
			{:else}
				<details bind:open={more}>
					<summary>{t('form.list.more')} <small>{moreSummary}</small></summary>
					{@render rest()}
				</details>
			{/if}
		</jl-form-fields>

		{#if list || more}
			<aside aria-labelledby="list-preview">
				<h2 id="list-preview">{t('form.list.preview')}</h2>
				{#if preview}
					<jl-preview inert><ListItem list={preview} author={!local && Boolean(session.did)} /></jl-preview>
				{:else}
					<p><small>{t('form.list.preview.empty')}</small></p>
				{/if}
			</aside>
		{/if}

		<jl-form-actions>
			{#if error}<p role="alert">{error}</p>{/if}
			<!-- Signing in is only asked to publish. -->
			{#if !local}<SaveHint />{/if}
			<menu>
				<button type="submit" disabled={busy}>{busy ? t('form.saving') : submitLabel}</button>
				{#if oncancel}<button type="button" onclick={oncancel}>{t('form.cancel')}</button>{/if}
			</menu>
		</jl-form-actions>
	</form>
	<SaveSignIn bind:this={signin} form="list" />
</jl-list-form>

<style>
	jl-list-form {
		display: block;
	}
	/* Editing: whose list it is, and that saving changes it for everyone. */
	jl-list-form > p {
		max-width: var(--reading-width);
		margin: 0 0 var(--space-s);
		padding: var(--space-s) var(--space-m);
		border-radius: var(--radius);
		background: var(--color-soft);
	}
	jl-form-fields,
	jl-form-actions,
	jl-preview {
		display: block;
	}
	/* The description grows with what is written. */
	textarea {
		field-sizing: content;
		min-height: var(--textarea-min);
		max-height: var(--textarea-max);
	}
	jl-form-fields > small,
	details > small {
		display: block;
	}
	small:has(> data) {
		display: flex;
		justify-content: space-between;
		gap: var(--space-s);
	}
	data {
		flex: none;
		font-variant-numeric: tabular-nums;
	}
	details {
		margin-top: var(--space-l);
	}
	summary small {
		color: var(--color-muted);
	}
	fieldset {
		margin: var(--space-l) 0 0;
		padding: 0;
		border: 0;
	}
	legend {
		display: flex;
		gap: var(--space-s);
		padding: 0;
		font-weight: var(--font-weight-strong);
	}
	legend data {
		color: var(--color-muted);
	}
	/* The list as it will show, under its fields (FormPage). */
	aside {
		margin-top: var(--space-l);
		padding: 0 var(--space-m);
		border: var(--border);
		border-radius: var(--radius);
	}
	aside h2 {
		margin: var(--space-s) 0 0;
		font-size: var(--font-size-small);
		color: var(--color-muted);
	}
	aside p {
		margin: var(--space-s) 0;
	}
	aside :global(jl-list) {
		border-bottom: 0;
	}
	jl-form-actions p {
		margin: var(--space-m) 0 0;
	}
	p small button {
		min-height: 0;
		padding: 0;
		border: 0;
		background: none;
		text-decoration: underline;
		font-size: inherit;
	}
</style>
