<script>
	import config from '#lib/data/config.json';
	import { session } from '#lib/auth/session.svelte.js';
	import { daysLeft, postPath } from '#lib/models/job-post.js';
	import { deleteJob, renewJob } from '#lib/network/save-job.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Edit, renew or delete an offer: shown to its poster only.
	 * @type {{post: import('#lib/models/job-post.js').JobPost, ondeleted?: () => void}}
	 */
	let { post, ondeleted } = $props();
	const mine = $derived(session.did === post.did);
	const left = $derived(daysLeft(post.expiresAt));
	let busy = $state(false);
	let renewed = $state(false);
	/** @type {string | null} */
	let error = $state(null);

	/** @param {() => Promise<void>} action */
	async function run(action) {
		busy = true;
		error = null;
		try {
			await action();
		} catch (err) {
			error = err instanceof Error ? err.message : String(err);
		} finally {
			busy = false;
		}
	}

	const renew = () =>
		run(async () => {
			await renewJob(post);
			renewed = true;
		});

	const remove = () =>
		confirm(t('post.confirmDelete')) &&
		run(async () => {
			await deleteJob(post);
			ondeleted?.();
		});
</script>

{#if mine}
	<jl-job-post-menu expired={left ? undefined : true}>
		<small>{left ? t('post.daysLeft', { count: left }) : t('job.expired')}</small>
		<menu>
			<a href="{postPath(post.did, post.rkey)}/edit">{t('post.change')}</a>
			<button type="button" disabled={busy} onclick={renew}>{t('post.renew', { count: config.jobPost.days })}</button>
			<button type="button" disabled={busy} onclick={remove}>{t('post.delete')}</button>
		</menu>
		{#if renewed}<p role="status"><small>{t('post.renewed')}</small></p>{/if}
		{#if error}<p role="alert">{error}</p>{/if}
	</jl-job-post-menu>
{/if}

<style>
	jl-job-post-menu {
		display: block;
	}
	jl-job-post-menu[expired] small {
		color: var(--color-warn);
	}
	menu {
		margin: var(--space-xs) 0 var(--space-s);
	}
	menu > * {
		font-size: var(--font-size-small);
	}
</style>
