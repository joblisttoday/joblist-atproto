<script>
	import config from '#lib/data/config.json';
	import webmcp from '#lib/data/webmcp.json';
	import ChoiceChips from './ChoiceChips.svelte';
	import JobApplyFields from './JobApplyFields.svelte';
	import JobCompanyField from './JobCompanyField.svelte';
	import JobPoster from './JobPoster.svelte';
	import LocationFields from './LocationFields.svelte';
	import { expiryDate, toApplyUrl, toForm } from '#lib/models/job-post.js';
	import { postJob, updateJob } from '#lib/network/save-job.js';
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

	// The form starts from the offer as it is now; the page remounts it for another one.
	const initialForm = () => toForm(post, company);
	let form = $state(initialForm());
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
				onsaved(await postJob(form));
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
		<small id="job-description-help">{t('post.description.help')}</small>

		<LocationFields bind:locations={form.locations} />

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

		{#if error}<p role="alert">{error}</p>{/if}
		<menu>
			<button type="submit" disabled={busy || !form.company}>
				{busy ? t('form.saving') : post ? t('form.save') : t('post.submit')}
			</button>
			{#if oncancel}<button type="button" onclick={oncancel}>{t('form.cancel')}</button>{/if}
		</menu>
	</form>
</jl-job-form>


