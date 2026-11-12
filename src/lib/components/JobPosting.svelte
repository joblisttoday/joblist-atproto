<script>
	import Icon from './Icon.svelte';
	import JobApply from './JobApply.svelte';
	import JobPostMenu from './JobPostMenu.svelte';
	import JobSave from './JobSave.svelte';
	import { markOf, toggleMark } from '#lib/network/job-marks.svelte.js';
	import PageMenu from './PageMenu.svelte';
	import { data, handleOf } from '#lib/network/network.svelte.js';
	import { isLive, notFromCompany, placeNames, postPageUrl, toJob } from '#lib/models/job-post.js';
	import { time } from '#lib/models/job.js';
	import { ago, longDate } from '#lib/i18n/dates.js';
	import { i18n, t } from '#lib/i18n/index.svelte.js';

	/**
	 * One job offer posted on joblist: what it is, keeping it (Save, I applied: in this browser,
	 * as any job), and how to apply.
	 * @type {{post: import('#lib/models/job-post.js').JobPost, ondeleted?: () => void}}
	 */
	let { post, ondeleted } = $props();
	const company = $derived(data.companies.get(post.company));
	const live = $derived(isLive(post.record.value));
	// Someone else's post for a company that posts its own: a warning, and no way to apply here.
	const unofficial = $derived(notFromCompany(post, data.claimed));
	const handle = $derived(handleOf(post.did));
	// As any job: saved and marked applied in this browser.
	const job = $derived(toJob(post));
	const name = $derived(company?.name || post.company);
	const mark = $derived(markOf(job));
	const facts = $derived(
		[
			placeNames(post.locations),
			post.remote && t(`job.remote.${post.remote}`),
			post.employment && t(`job.employment.${post.employment}`)
		].filter(Boolean)
	);
	// The offer's own page elsewhere, when it has one.
	const offer = $derived(post.url !== postPageUrl(post) && /^https?:\/\//i.test(post.url) ? post.url : '');
</script>

<jl-job-posting verified={post.verified || undefined} expired={live ? undefined : true} unofficial={unofficial || undefined}>
	<header>
		<!-- Its menu at the right edge of its title, as on every page (PageHeader). -->
		<jl-job-title><h1>{post.title}</h1><PageMenu /></jl-job-title>
		<p>
			<a href="/{post.company}">{company?.name || post.company}</a>
			{#if post.verified}
				· <mark><Icon name="verified" /> {t('job.verified')}</mark>
			{:else}
				<small>· {t('job.sharedBy')} <a href="/{handle}">@{handle}</a></small>
			{/if}
		</p>
		{#if facts.length}<p>{facts.join(' · ')}</p>{/if}
		<p>
			<small>
				{t('job.posted', { ago: ago(time(post.createdAt), i18n.locale) })} ·
				{live ? t('job.until', { date: longDate(post.expiresAt, i18n.locale) }) : t('job.expired')}
			</small>
		</p>
		<menu data-keep>
			<JobSave {job} company={name} />
			<button type="button" aria-pressed={mark === 'applied'} onclick={() => toggleMark(job, 'applied', name)}><Icon name="applied" /> {t(mark === 'applied' ? 'marks.applied' : 'marks.apply')}</button>
		</menu>
		<JobPostMenu {post} {ondeleted} />
		{#if unofficial}<p role="alert">{t('job.notFromCompany', { company: company?.name || post.company })}</p>{/if}
	</header>

	{#if post.description}<p>{post.description}</p>{/if}
	{#if offer && !unofficial}<p><a href={offer} target="_blank" rel="noopener">{t('job.offer')} <Icon name="external" /></a></p>{/if}

	{#if live && !unofficial}<JobApply {post} />{/if}
</jl-job-posting>

<style>
	jl-job-posting {
		display: block;
	}
	jl-job-title {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
		gap: var(--space-m);
		margin: var(--space-m) 0 var(--space-xs);
	}
	h1 {
		margin: 0;
	}
	header {
		margin-bottom: var(--space-l);
	}
	header p {
		margin-bottom: var(--space-xs);
	}
	header + p {
		white-space: pre-line;
		overflow-wrap: anywhere;
	}
	[data-keep] {
		flex-wrap: wrap;
		gap: var(--space-xs);
		margin: var(--space-s) 0;
	}
	mark {
		background: none;
		color: var(--color-ok);
	}
	jl-job-posting[unofficial] [role='alert'] {
		color: var(--color-error);
	}
	jl-job-posting[expired] h1 {
		color: var(--color-muted);
	}
</style>
