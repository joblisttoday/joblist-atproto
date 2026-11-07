<script>
	import Icon from './Icon.svelte';
	import JobApply from './JobApply.svelte';
	import JobPostMenu from './JobPostMenu.svelte';
	import { data, handleOf } from '#lib/network/network.svelte.js';
	import { isLive, notFromCompany, placeNames, postPageUrl } from '#lib/models/job-post.js';
	import { time } from '#lib/models/job.js';
	import { ago, longDate } from '#lib/i18n/dates.js';
	import { i18n, t } from '#lib/i18n/index.svelte.js';

	/**
	 * One job offer posted on joblist: what it is and how to apply.
	 * @type {{post: import('#lib/models/job-post.js').JobPost, ondeleted?: () => void}}
	 */
	let { post, ondeleted } = $props();
	const company = $derived(data.companies.get(post.company));
	const live = $derived(isLive(post.record.value));
	// Someone else's post for a company that posts its own: a warning, and no way to apply here.
	const unofficial = $derived(notFromCompany(post, data.claimed));
	const handle = $derived(handleOf(post.did));
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
		<h1>{post.title}</h1>
		<p>
			<a href="/company/{post.company}">{company?.name || post.company}</a>
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
	h1 {
		margin-bottom: var(--space-xs);
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
