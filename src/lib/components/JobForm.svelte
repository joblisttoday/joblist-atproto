<script>
	import config from '#lib/data/config.json';
	import webmcp from '#lib/data/webmcp.json';
	import JobApplyFields from './JobApplyFields.svelte';
	import JobCompanyField from './JobCompanyField.svelte';
	import JobPoster from './JobPoster.svelte';
	import LocationFields from './LocationFields.svelte';
	import { expiryDate, toApplyUrl, toForm } from '#lib/models/job-post.js';
	import { postJob, updateJob } from '#lib/network/save-job.js';
	import { longDate } from '#lib/i18n/dates.js';
	import { i18n, t } from '#lib/i18n/index.svelte.js';

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

	const { remote, employment, maxDays } = config.jobPost;
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

		<jl-job-form-choices>
			<span>
				<label for="job-remote">{t('post.remote')}</label>
				<select id="job-remote" name="remote" toolparamdescription={tool.params.remote} bind:value={form.remote}>
					<option value="">{t('post.notSaid')}</option>
					{#each remote as value (value)}<option {value}>{t(`job.remote.${value}`)}</option>{/each}
				</select>
			</span>
			<span>
				<label for="job-employment">{t('post.employment')}</label>
				<select
					id="job-employment"
					name="employment"
					toolparamdescription={tool.params.employment}
					bind:value={form.employment}
				>
					<option value="">{t('post.notSaid')}</option>
					{#each employment as value (value)}<option {value}>{t(`job.employment.${value}`)}</option>{/each}
				</select>
			</span>
		</jl-job-form-choices>

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

		<label for="job-days">{t('post.days')}</label>
		<input
			id="job-days"
			name="days"
			toolparamdescription={tool.params.days}
			bind:value={form.days}
			type="number"
			inputmode="numeric"
			min="1"
			max={maxDays}
			required
			aria-describedby="job-days-help"
		/>
		<small id="job-days-help">{t('post.days.help', { date: until, max: maxDays })}</small>

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
	jl-job-form-choices {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-s);
	}
</style>
