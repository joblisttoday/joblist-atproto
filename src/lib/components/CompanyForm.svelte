<script>
	import config from '#lib/data/config.json';
	import webmcp from '#lib/data/webmcp.json';
	import CompanyBoardFields from './CompanyBoardFields.svelte';
	import CompanyEditNote from './CompanyEditNote.svelte';
	import CompanyItem from './CompanyItem.svelte';
	import CompanyWebsiteField from './CompanyWebsiteField.svelte';
	import LinkFields from './LinkFields.svelte';
	import LocationFields from './LocationFields.svelte';
	import TagInput from './TagInput.svelte';
	import { session } from '#lib/auth/session.svelte.js';
	import { data } from '#lib/network/network.svelte.js';
	import { saveCompany } from '#lib/network/save-company.js';
	import { clearCompanyDraft, readCompanyDraft, writeCompanyDraft } from '#lib/network/company-draft.js';
	import { toForm } from '#lib/models/company.js';
	import { draftApplies, previewCompany, readLink, readWebsite, saveOutcome } from '#lib/models/company-form.js';
	import { withPrefill } from '#lib/models/paste.js';
	import { i18n, t } from '#lib/i18n/index.svelte.js';
	import { onMount, untrack } from 'svelte';

	/**
	 * Describe a company, or edit one: either way the person saves their own version.
	 * @type {{
	 *   company?: import('#lib/models/company.js').Company | null,
	 *   prefill?: Parameters<typeof withPrefill>[1],
	 *   focus?: string,
	 *   onsaved: (saved: {key: string, name: string, outcome: ReturnType<typeof saveOutcome>, added: boolean}) => void,
	 *   oncancel?: () => void
	 * }}
	 *   focus: the part to start on (description, jobBoard, locations, tags, links), from an invitation on the company page.
	 */
	let { company = null, prefill = {}, focus = '', onsaved, oncancel } = $props();

	// An edit starts from the version shown; a new company from the draft kept in this
	// browser (when it is the same company), its gaps filled from what was pasted.
	const draft = untrack(() => (company ? null : readCompanyDraft(toForm(null))));
	let restored = $state(untrack(() => Boolean(draft && draftApplies(draft, prefill))));
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
		form = fill(toForm(null));
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
		busy = true;
		try {
			const outcome = saveOutcome(company, session.handle || '');
			const added = !company;
			const key = await saveCompany(form, company);
			if (added) clearCompanyDraft();
			onsaved({ key, name: form.name.trim(), outcome, added });
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
		} finally {
			busy = false;
		}
	}
</script>

<jl-company-form editing={company ? true : undefined}>
	<CompanyEditNote {company} />
	<form bind:this={formElement} onsubmit={submit} toolname={tool.toolname} tooldescription={tool.tooldescription}>
		<p><small data-required>{t('form.required')}</small></p>
		<jl-form-fields>
			{#if restored}
				<p><small>{t('form.company.draft')} <button type="button" onclick={startOver}>{t('form.company.draft.clear')}</button></small></p>
			{/if}

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

			<jl-form-part part-name="jobBoard">
				<CompanyBoardFields bind:provider={form.provider} bind:boardId={form.boardId} bind:careersUrl={form.careersUrl} params={tool.params} />
			</jl-form-part>

			<jl-form-part part-name="tags">
				<TagInput bind:tags={form.tags} tool={tool.params.tags} />
			</jl-form-part>

			<jl-form-part part-name="locations">
				<LocationFields bind:locations={form.locations} />
			</jl-form-part>

			<jl-form-part part-name="links">
				<LinkFields bind:links={form.links} tool={tool.params.links} />
			</jl-form-part>
		</jl-form-fields>

		<aside aria-labelledby="company-preview">
			<h2 id="company-preview">{t('form.company.preview')}</h2>
			{#if preview}
				<jl-preview inert><CompanyItem company={preview} /></jl-preview>
				{#if preview.description}<blockquote>{preview.description}</blockquote>{/if}
			{:else}
				<p><small>{t('form.company.preview.empty')}</small></p>
			{/if}
		</aside>

		<jl-form-actions>
			{#if error}<p role="alert">{error}</p>{/if}
			{#if !key}<p><small>{t('form.company.needsWebsite')}</small></p>{/if}
			{#if taken}<p><small>{t('form.company.taken')} <a href="/add?key={encodeURIComponent(key)}">{t('form.website.improve')}</a></small></p>{/if}
			<menu>
				<button type="submit" disabled={busy || !key || taken}>{busy ? t('form.saving') : company ? t('form.save') : t('form.company.submit')}</button>
				{#if oncancel}<button type="button" onclick={oncancel}>{t('form.cancel')}</button>{/if}
			</menu>
		</jl-form-actions>
	</form>
</jl-company-form>

<style>
	jl-form-part {
		display: block;
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
	/* The company as it will show: under the fields on phones, beside them on wide screens. */
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
	@media (min-width: 64rem) {
		form {
			display: grid;
			grid-template-columns: minmax(0, var(--reading-width)) minmax(0, var(--aside-width));
			column-gap: var(--gutter);
			align-items: start;
		}
		form > :not(aside) {
			grid-column: 1;
		}
		aside {
			grid-column: 2;
			grid-row: 1 / 4;
			position: sticky;
			top: calc(var(--header-height) + var(--space-m));
			margin-top: 0;
		}
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
