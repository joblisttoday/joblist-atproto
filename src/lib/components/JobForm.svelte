<script>
	import config from '#lib/data/config.json';
	import webmcp from '#lib/data/webmcp.json';
	import ChoiceChips from './ChoiceChips.svelte';
	import JobApplyFields from './JobApplyFields.svelte';
	import JobCompanyField from './JobCompanyField.svelte';
	import JobItem from './JobItem.svelte';
	import JobPoster from './JobPoster.svelte';
	import LocationFields from './LocationFields.svelte';
	import { expiryDate, placeNames, toApplyUrl, toForm } from '#lib/models/job-post.js';
	import { postJob, updateJob } from '#lib/network/save-job.js';
	import { data } from '#lib/network/network.svelte.js';
	import { session } from '#lib/auth/session.svelte.js';
	import { clearDraft, readDraft, writeDraft } from '#lib/network/job-draft.js';
	import { longDate } from '#lib/i18n/dates.js';
	import { i18n, t } from '#lib/i18n/index.svelte.js';
	import { untrack } from 'svelte';

	/**
	 * Post a job offer, or edit one of the signed-in person's offers.
	 * @type {{
	 *   post?: import('#lib/models/job-post.js').JobPost | null,
	 *   company?: string,
	 *   onsaved: (rkey: string) => void,
	 *   oncancel?: () => void
	 * }}
	 */
	let { post = null, company = '', onsaved, oncancel } = $props();

	// The form starts from the offer as it is now (the page remounts it for another one),
	// or, for a new one, from the draft kept in this browser.
	const initialForm = () => {
		if (post) return toForm(post, company);
		const draft = readDraft(toForm(null, company));
		return draft ? { ...draft, company: company || draft.company } : toForm(null, company);
	};
	let form = $state(initialForm());
	const restored = untrack(() => !post) && Boolean(readDraft(toForm(null)));
	// A new offer is kept as it is written.
	$effect(() => {
		if (!post) writeDraft($state.snapshot(form));
	});
	function startOver() {
		clearDraft();
		form = toForm(null, company);
	}
	// The offer as it will show in the results, while it is written.
	const preview = $derived(
		form.company && form.title.trim()
			? {
					title: form.title.trim(),
					url: '',
					company: form.company,
					location: placeNames(form.locations.filter((l) => l.name)) || undefined,
					remote: form.remote || undefined,
					published: new Date().toISOString()
				}
			: null
	);
	// Signed in as a company's account: its own company, unless another was chosen.
	$effect(() => {
		if (!post && !form.company && session.handle && data.companies.has(session.handle)) form.company = session.handle;
	});
	let busy = $state(false);
	let tried = $state(false);
	/** @type {string | null} */
	let error = $state(null);

	const { remote, employment, maxDays, dayChoices } = config.jobPost;
	const notSaid = $derived({ value: '', label: t('post.notSaid') });
	const remoteOptions = $derived([...remote.map((value) => ({ value, label: t(`job.remote.${value}`) })), notSaid]);
	const employmentOptions = $derived([...employment.map((value) => ({ value, label: t(`job.employment.${value}`) })), notSaid]);
	// How long it is shown, as a few lengths (and the offer's own, when editing one of another length).
	let days = $state(String(untrack(() => form.days)));
	$effect(() => {
		form.days = Number(days);
	});
	const dayOptions = $derived(
		[...new Set([...dayChoices, untrack(() => form.days)])]
			.filter((d) => d >= 1 && d <= maxDays)
			.sort((a, b) => a - b)
			.map((d) => ({ value: String(d), label: t('post.days.choice', { count: d }) }))
	);
	const canApply = $derived(Boolean(toApplyUrl(form.applyTo) || form.bluesky));
	const until = $derived(longDate(expiryDate(form.days), i18n.locale));
	// Back here from describing a missing company.
	const back = '/jobs/new';
	// WebMCP: an AI assistant may fill this form; the person checks it and posts.
	const tool = webmcp.forms.job;

	/** @param {SubmitEvent} event */
	async function submit(event) {
		event.preventDefault();
		tried = true;
		if (!form.company || !canApply) return;
		busy = true;
		error = null;
		try {
			if (post) {
				await updateJob(post, form);
				onsaved(post.rkey);
			} else {
				const rkey = await postJob(form);
				clearDraft();
				onsaved(rkey);
			}
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
		} finally {
			busy = false;
		}
	}
</script>

<jl-job-form editing={post ? true : undefined}>
	<form onsubmit={submit} toolname={tool.toolname} tooldescription={tool.tooldescription}>
		<p><small data-required>{t('form.required')}</small></p>
		{#if restored}
			<p><small>{t('post.draft')} <button type="button" onclick={startOver}>{t('post.draft.clear')}</button></small></p>
		{/if}
		<JobCompanyField bind:company={form.company} {back} locked={Boolean(post)} />
		{#if form.company}<JobPoster company={form.company} />{/if}

		<label for="job-title">{t('post.jobTitle')}</label>
		<input
			id="job-title"
			name="title"
			toolparamdescription={tool.params.title}
			bind:value={form.title}
			required
			maxlength={config.jobPost.titleMax}
			placeholder={t('post.jobTitle.placeholder')}
		/>

		<label for="job-description">{t('post.description')}</label>
		<textarea
			id="job-description"
			name="description"
			toolparamdescription={tool.params.description}
			bind:value={form.description}
			maxlength={config.jobPost.descriptionMax}
			aria-describedby="job-description-help"
		></textarea>
		<small id="job-description-help">
			{t('post.description.help')}
			<data value={form.description.length}>{form.description.length.toLocaleString(i18n.locale)} / {config.jobPost.descriptionMax.toLocaleString(i18n.locale)}</data>
		</small>

		<LocationFields bind:locations={form.locations} suggested={data.companies.get(form.company)?.locations} />

		<ChoiceChips name="remote" legend={t('post.remote')} options={remoteOptions} bind:value={form.remote} tool={tool.params.remote} />
		<ChoiceChips name="employment" legend={t('post.employment')} options={employmentOptions} bind:value={form.employment} tool={tool.params.employment} />

		<label for="job-offer">{t('post.offerUrl')}</label>
		<input
			id="job-offer"
			name="offerUrl"
			toolparamdescription={tool.params.offerUrl}
			bind:value={form.offerUrl}
			type="url"
			inputmode="url"
			autocapitalize="none"
			spellcheck="false"
			placeholder="https://"
			aria-describedby="job-offer-help"
		/>
		<small id="job-offer-help">{t('post.offerUrl.help')}</small>

		<JobApplyFields
			bind:applyTo={form.applyTo}
			bind:bluesky={form.bluesky}
			missing={tried && !canApply}
			params={tool.params}
		/>

		<ChoiceChips
			name="days"
			legend={t('post.days')}
			options={dayOptions}
			bind:value={days}
			required
			help={t('post.days.help', { date: until, max: maxDays })}
			tool={tool.params.days}
		/>

		{#if preview}
			<section aria-labelledby="job-preview">
				<h2 id="job-preview">{t('post.preview')}</h2>
				<JobItem job={preview} company={data.companies.get(form.company)?.name || form.company} />
			</section>
		{/if}

		{#if error}<p role="alert">{error}</p>{/if}
		<menu>
			<button type="submit" disabled={busy || !form.company}>
				{busy ? t('form.saving') : post ? t('form.save') : t('post.submit')}
			</button>
			{#if oncancel}<button type="button" onclick={oncancel}>{t('form.cancel')}</button>{/if}
		</menu>
	</form>
</jl-job-form>

<style>
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
	section {
		margin-top: var(--space-l);
		padding: 0 var(--space-m);
		border: var(--border);
		border-radius: var(--radius);
	}
	section h2 {
		margin: var(--space-s) 0 0;
		font-size: var(--font-size-small);
		color: var(--color-muted);
	}
	data {
		flex: none;
		font-variant-numeric: tabular-nums;
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
