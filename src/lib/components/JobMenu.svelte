<script>
	import CardMenu from './CardMenu.svelte';
	import Icon from './Icon.svelte';
	import { postPath } from '#lib/models/job-post.js';
	import { savedIn, toggleJob } from '#lib/network/job-collections.svelte.js';
	import { markOf, toggleMark } from '#lib/network/job-marks.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * A job card's "…": save or hide it (in this browser), its organization, the offer, its link.
	 * @type {{job: import('#lib/ats/job.js').Job, company?: string}} company: its name
	 */
	let { job, company = '' } = $props();
	const name = $derived(company || job.company);
	const saved = $derived(savedIn(job).includes('saved'));
	const hidden = $derived(markOf(job) === 'hidden');
	// A job posted on joblist has its page here; any other, on its organization's board.
	const posted = $derived(job.posted ? postPath(job.posted.did, job.posted.rkey) : '');
	let copied = $state(false);

	/** @param {() => void} done */
	async function copy(done) {
		try {
			await navigator.clipboard.writeText(posted ? new URL(posted, location.href).href : job.url);
			copied = true;
			setTimeout(() => ((copied = false), done()), 1200);
		} catch {
			done();
		}
	}
</script>

<CardMenu label={t('card.actions', { name: job.title })}>
	{#snippet items(done)}
		<li><button type="button" onclick={() => (toggleJob(job, 'saved', name), done())}><Icon name={saved ? 'savedOn' : 'save'} /> {t(saved ? 'collections.saved' : 'collections.save')}</button></li>
		<li><button type="button" onclick={() => (toggleMark(job, 'hidden', name), done())}><Icon name={hidden ? 'unhide' : 'hide'} /> {t(hidden ? 'card.show' : 'marks.hide')}</button></li>
		<li><a href="/company/{job.company}" onclick={done}><Icon name="companies" /> {name}</a></li>
		{#if posted}
			<li><a href={posted} onclick={done}><Icon name="jobs" /> {t('card.open')}</a></li>
		{:else}
			<li><a href={job.url} target="_blank" rel="noopener" onclick={done}><Icon name="external" /> {t('card.open')}</a></li>
		{/if}
		<li><button type="button" onclick={() => copy(done)}><Icon name="copy" /> {t(copied ? 'menu.copied' : 'card.copy')}</button></li>
	{/snippet}
</CardMenu>
