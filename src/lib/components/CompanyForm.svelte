<script>
	import { ownPath } from '#lib/network/own-organization.svelte.js';
	import ChoiceChips from './ChoiceChips.svelte';
	import config from '#lib/data/config.json';
	import webmcp from '#lib/data/webmcp.json';
	import CompanyBoardFields from './CompanyBoardFields.svelte';
	import CompanyEditNote from './CompanyEditNote.svelte';
	import CompanyItem from './CompanyItem.svelte';
	import CompanyWebsiteField from './CompanyWebsiteField.svelte';
	import LinkFields from './LinkFields.svelte';
	import LocationFields from './LocationFields.svelte';
	import SaveHint from './SaveHint.svelte';
	import SaveResumed from './SaveResumed.svelte';
	import SaveSignIn from './SaveSignIn.svelte';
	import TagInput from './TagInput.svelte';
	import { session } from '#lib/auth/session.svelte.js';
	import { data } from '#lib/network/network.svelte.js';
	import { saveCompany } from '#lib/network/save-company.js';
	import { clearCompanyDraft, readCompanyDraft, writeCompanyDraft } from '#lib/network/company-draft.js';
	import { backToSave, leftToSave } from '#lib/network/drafts.js';
	import { mayDescribe, toForm } from '#lib/models/company.js';
	import { draftApplies, previewCompany, readLink, readWebsite } from '#lib/models/company-form.js';
	import { withPrefill } from '#lib/models/paste.js';
	import { i18n, t } from '#lib/i18n/index.svelte.js';
	import { onMount, untrack } from 'svelte';

	/**
	 * Describe a company, or edit one: either way the person saves their own version.
	 * @type {{
	 *   company?: import('#lib/models/company.js').Company | null,
	 *   prefill?: Parameters<typeof withPrefill>[1],
	 *   focus?: string,
	 *   onsaved: (saved: {key: string, name: string, added: boolean}) => void,
	 *   oncancel?: () => void
	 * }}
	 *   focus: one part to edit alone, the rest kept as it is (description, jobBoard, kind, tags, locations, links), from the dashboard.
	 */
	let { company = null, prefill = {}, focus = '', onsaved, oncancel } = $props();

	// An edit starts from the version shown (or from the edit kept while signing in to save it);
	// a new company from the draft kept in this browser (when it is the same company),
	// its gaps filled from what was pasted.
	const draft = untrack(() => (company && !backToSave('company') ? null : readCompanyDraft(toForm(null))));
	let restored = $state(untrack(() => Boolean(draft && draftApplies(draft, company ? { url: company.key } : prefill))));
	/** @param {import('#lib/models/company.js').CompanyForm} start */
	const fill = (start) => {
		const form = withPrefill(start, untrack(() => prefill));
		return { ...form, links: form.links.length ? form.links : [''] };
	};
	let form = $state(fill(untrack(() => (restored && draft ? draft : toForm(company)))));
	$effect(() => {
		if (!company) writeCompanyDraft($state.snapshot(form));
	});
	function startOver() {
		clearCompanyDraft();
		restored = false;
		form = fill(toForm(company));
	}

	const website = $derived(readWebsite(form.url, data.companies, company?.key));
	const key = $derived(website.key);
	// Already on joblist: improving it starts from the version shown (Edit it), not from an empty form
	// whose saving would show a thinner version in its place.
	const taken = $derived(!company && website.state === 'exists');
	const badLinks = $derived(form.links.some((l) => readLink(l).state === 'invalid'));
	const preview = $derived(previewCompany(form, key));
	const { nameMax, descriptionMax } = config.companyForm;
	let busy = $state(false);
	/** @type {string | null} */
	let error = $state(null);
	// WebMCP: an AI assistant may fill this form; the person still checks it and saves.
	const tool = webmcp.forms.company;
	/** @type {SaveSignIn | undefined} */
	let signin = $state();
	// Optional: "Not said" first, so a choice can be taken back.
	const kindOptions = [{ value: '', label: t('kind.none') }, ...config.companyForm.kinds.map((kind) => ({ value: kind, label: t(`kind.${kind}`) }))];
	const submitLabel = $derived(company ? t('form.save') : t('form.company.submit'));
	// Editing one part (/{domain}/edit?field=…): only that part, the rest kept as it is.
	const parts = ['description', 'jobBoard', 'kind', 'tags', 'locations', 'links'];
	const only = $derived(company && parts.includes(focus) ? focus : '');
	/** @param {string} part */
	const shows = (part) => !only || only === part;

	/** @type {HTMLFormElement} */
	let formElement;
	// Sent here to fill one part (an invitation on the company page): start there.
	onMount(() => {
		const part = focus && formElement.querySelector(`[part-name="${CSS.escape(focus)}"]`);
		if (!part) return;
		const field = [...part.querySelectorAll('input, textarea')].find(
			(el) => el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement ? el.type !== 'radio' && el.checkVisibility() : false
		);
		part.scrollIntoView({ block: 'center' });
		if (field instanceof HTMLElement) field.focus({ preventScroll: true });
	});

	/** @param {SubmitEvent} event */
	async function submit(event) {
		event.preventDefault();
		error = null;
		if (!key) return;
		if (badLinks) {
			error = t('form.link.fix');
			return;
		}
		// Signed out: what is written stays in this browser while signing in (an edit too), then is saved from here.
		if (!session.did) {
			if (company) writeCompanyDraft($state.snapshot(form));
			return signin?.ask();
		}
		// Only the organization itself describes it, signed in with its domain as handle.
		if (!mayDescribe({ key }, session)) {
			error = t('form.company.notYours', { domain: key });
			return;
		}
		busy = true;
		try {
			const added = !company;
			const key = await saveCompany(form, company);
			if (added || restored) clearCompanyDraft();
			leftToSave(null);
			onsaved({ key, name: form.name.trim(), added });
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
		} finally {
			busy = false;
		}
	}
</script>

<jl-company-form editing={company ? true : undefined} data-only={only || undefined}>
	{#if !only}<CompanyEditNote {company} />{/if}
	<form bind:this={formElement} onsubmit={submit} toolname={tool.toolname} tooldescription={tool.tooldescription}>
		{#if !only}<p><small data-required>{t('form.required')}</small></p>{/if}
		<jl-form-fields>
			<SaveResumed form="company" label={submitLabel} />
			{#if restored}
				<p><small>{t('form.company.draft')} <button type="button" onclick={startOver}>{t('form.company.draft.clear')}</button></small></p>
			{/if}

			{#if !only}
			<CompanyWebsiteField bind:url={form.url} editing={company?.key} tool={tool.params.url} />

			<label for="name">{t('form.name')}</label>
			<input
				id="name"
				name="name"
				toolparamdescription={tool.params.name}
				bind:value={form.name}
				required
				maxlength={nameMax}
				autocomplete="organization"
			/>
			{/if}

			{#if shows('description')}
			<jl-form-part part-name="description">
				<label for="description">{t('form.description')}</label>
				<textarea
					id="description"
					name="description"
					toolparamdescription={tool.params.description}
					bind:value={form.description}
					maxlength={descriptionMax}
					placeholder={t('form.description.placeholder')}
					aria-describedby="description-help"
				></textarea>
				<small id="description-help">
					{t('form.description.help')}
					<data value={form.description.length}>{form.description.length.toLocaleString(i18n.locale)} / {descriptionMax.toLocaleString(i18n.locale)}</data>
				</small>
			</jl-form-part>
			{/if}

			{#if shows('jobBoard')}
			<jl-form-part part-name="jobBoard">
				<CompanyBoardFields bind:provider={form.provider} bind:boardId={form.boardId} bind:careersUrl={form.careersUrl} params={tool.params} />
			</jl-form-part>
			{/if}

			{#if shows('kind')}
			<jl-form-part part-name="kind">
				<ChoiceChips name="kind" legend={t('form.kind')} options={kindOptions} bind:value={form.kind} help={t('form.kind.help')} />
			</jl-form-part>
			{/if}

			{#if shows('tags')}
			<jl-form-part part-name="tags">
				<TagInput bind:tags={form.tags} tool={tool.params.tags} />
			</jl-form-part>
			{/if}

			{#if shows('locations')}
			<jl-form-part part-name="locations">
				<LocationFields bind:locations={form.locations} />
			</jl-form-part>
			{/if}

			{#if shows('links')}
			<jl-form-part part-name="links">
				<LinkFields bind:links={form.links} tool={tool.params.links} />
			</jl-form-part>
			{/if}
		</jl-form-fields>

		{#if !only}
		<aside aria-labelledby="company-preview">
			<h2 id="company-preview">{t('form.company.preview')}</h2>
			{#if preview}
				<jl-preview inert><CompanyItem company={preview} menu={false} /></jl-preview>
				{#if preview.description}<blockquote>{preview.description}</blockquote>{/if}
			{:else}
				<p><small>{t('form.company.preview.empty')}</small></p>
			{/if}
		</aside>
		{/if}

		<jl-form-actions>
			{#if error}<p role="alert">{error}</p>{/if}
			{#if !key}<p><small>{t('form.company.needsWebsite')}</small></p>{/if}
			{#if taken}<p><small>{t('form.company.taken')} <a href="{ownPath('edit')}?all">{t('form.website.improve')}</a></small></p>{/if}
			<SaveHint />
			<menu>
				<button type="submit" disabled={busy || !key || taken}>{busy ? t('form.saving') : submitLabel}</button>
				{#if oncancel}<button type="button" onclick={oncancel}>{t('form.cancel')}</button>{/if}
			</menu>
		</jl-form-actions>
	</form>
	<SaveSignIn bind:this={signin} form="company" />
</jl-company-form>

<style>
	jl-form-part {
		display: block;
	}
	/* One part alone: the page's title already names it; its own heading is for screen readers. */
	jl-company-form[data-only] jl-form-part > label:first-child,
	jl-company-form[data-only] jl-form-part :global(fieldset:first-of-type > legend:first-child),
	jl-company-form[data-only] jl-form-part :global(jl-tag-input > label:first-child) {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	/* The description grows with what is written. */
	textarea {
		field-sizing: content;
		min-height: var(--textarea-min);
		max-height: var(--textarea-max);
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
	jl-form-fields,
	jl-form-actions,
	jl-preview {
		display: block;
	}
	/* The company as it will show, under its fields (FormPage). */
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
	/* The start of the description, as on its page. */
	blockquote {
		display: -webkit-box;
		margin: var(--space-s) 0;
		overflow: hidden;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		color: var(--color-muted);
		font-size: var(--font-size-small);
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
