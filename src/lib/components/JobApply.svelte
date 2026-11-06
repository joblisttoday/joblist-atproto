<script>
	import Icon from './Icon.svelte';
	import config from '#lib/data/config.json';
	import { handleOf } from '#lib/network/network.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Where to apply. Links only: the application goes from the candidate
	 * to the poster, and joblist never sees it (no messages, no forms here).
	 * @type {{post: import('#lib/models/job-post.js').JobPost}}
	 */
	let { post } = $props();
	const url = $derived(post.apply.url || '');
	const email = $derived(/^mailto:/i.test(url));
	const web = $derived(/^https?:\/\//i.test(url));
	const handle = $derived(handleOf(post.did));
	// Bluesky has no public link that opens a new conversation: its profile has a Message button.
	const profile = $derived(config.links.profile.replace('{handle}', handle));
</script>

<jl-job-apply>
	<section aria-labelledby="job-apply">
		<h2 id="job-apply">{t('job.apply')}</h2>
		{#if web || email || post.apply.bluesky}
			<menu>
				{#if web}<a href={url} target="_blank" rel="noopener">{t('job.apply.link')} <Icon name="external" /></a>{/if}
				{#if email}<a href={url}>{t('job.apply.email')}</a>{/if}
				{#if post.apply.bluesky}<a href={profile} target="_blank" rel="noopener">{t('job.apply.bluesky', { handle })} <Icon name="external" /></a>{/if}
			</menu>
			{#if post.apply.bluesky}<p><small>{t('job.apply.bluesky.help')}</small></p>{/if}
		{:else}
			<p>{t('job.apply.none')}</p>
		{/if}
		<p><small>{t('job.apply.privacy')}</small></p>
	</section>
</jl-job-apply>

<style>
	jl-job-apply {
		display: block;
	}
	menu > a:first-child {
		background: var(--color-accent);
		color: var(--color-accent-fg);
		border-color: var(--color-accent);
	}
</style>
