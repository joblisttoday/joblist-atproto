<script>
	import CardMenu from './CardMenu.svelte';
	import ConfirmDialog from './ConfirmDialog.svelte';
	import Icon from './Icon.svelte';
	import config from '#lib/data/config.json';
	import { daysLeft, placeNames, postPath } from '#lib/models/job-post.js';
	import { time } from '#lib/models/job.js';
	import { deleteJob, renewJob } from '#lib/network/save-job.js';
	import { ago } from '#lib/i18n/dates.js';
	import { i18n, t } from '#lib/i18n/index.svelte.js';

	/**
	 * One of an organization's job offers, on its home: its title (its page), whether it is
	 * shown and for how long, where it is and when it was posted; Renew when it matters
	 * (expired, or ending within config.jobPost.renewWithin days); Edit and the rest in "…".
	 * @type {{post: import('#lib/models/job-post.js').JobPost}}
	 */
	let { post } = $props();
	const left = $derived(daysLeft(post.expiresAt));
	const soon = $derived(left <= config.jobPost.renewWithin);
	const href = $derived(postPath(post.did, post.rkey));
	const facts = $derived([post.remote && t(`job.remote.${post.remote}`), placeNames(post.locations), t('job.posted', { ago: ago(time(post.createdAt), i18n.locale) })].filter(Boolean));
	let busy = $state(false);
	let copied = $state(false);
	/** @type {string | null} */
	let error = $state(null);
	/** @type {ConfirmDialog | undefined} */
	let confirmer = $state();

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
	const renew = () => run(() => renewJob(post));
	const remove = () => run(() => deleteJob(post));

	/** @param {() => void} done */
	async function copy(done) {
		try {
			await navigator.clipboard.writeText(new URL(href, location.href).href);
			copied = true;
			setTimeout(() => ((copied = false), done()), config.layout.copiedMs);
		} catch {
			done();
		}
	}
</script>

<jl-job-post-card state={!left ? 'expired' : soon ? 'soon' : 'open'}>
	<header>
		<a {href}>{post.title}</a>
		<CardMenu label={t('card.actions', { name: post.title })}>
			{#snippet items(done)}
				<li><a href="{href}/edit" onclick={done}><Icon name="edit" /> {t('post.change')}</a></li>
				<li><button type="button" disabled={busy} onclick={() => (renew(), done())}><Icon name="next" /> {t('post.renew', { count: config.jobPost.days })}</button></li>
				<li><button type="button" onclick={() => copy(done)}><Icon name="copy" /> {t(copied ? 'menu.copied' : 'card.copy')}</button></li>
				<li><button type="button" disabled={busy} onclick={() => (confirmer?.ask(), done())}><Icon name="delete" /> {t('post.delete')}</button></li>
			{/snippet}
		</CardMenu>
	</header>
	<p><mark>{!left ? t('post.expired') : t('post.daysLeft', { count: left })}</mark> <small>{facts.join(' · ')}</small></p>
	{#if soon}
		<menu><button type="button" disabled={busy} onclick={renew} data-primary={!left || undefined}>{t('post.renew', { count: config.jobPost.days })}</button></menu>
	{/if}
	{#if error}<p role="alert">{error}</p>{/if}
	<ConfirmDialog bind:this={confirmer} title={t('post.confirmDelete')} confirm={t('post.delete')} onconfirm={remove} />
</jl-job-post-card>

<style>
	jl-job-post-card {
		display: block;
		padding: var(--space-s) var(--space-m);
		border: var(--border);
		border-radius: var(--radius-large);
	}
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-s);
	}
	header > a {
		font-size: var(--font-size-large, 1.125rem);
		font-weight: var(--font-weight-strong);
		color: var(--color-fg);
		text-decoration: none;
	}
	header > a:hover {
		text-decoration: underline;
	}
	p {
		margin: var(--space-xxs) 0;
	}

	mark {
		display: inline-block;
		padding: 0 var(--space-s);
		border-radius: var(--radius-round);
		background: var(--color-soft);
		color: var(--color-ok);
		font-size: var(--font-size-small);
		font-weight: var(--font-weight-strong);
	}
	jl-job-post-card[state='soon'] mark,
	jl-job-post-card[state='expired'] mark {
		color: var(--color-warn);
	}
	jl-job-post-card[state='expired'] header > a {
		color: var(--color-muted);
	}
	small {
		color: var(--color-muted);
	}
	menu {
		gap: var(--space-xs);
		margin: var(--space-s) 0 0;
	}
	menu > * {
		font-size: var(--font-size-small);
	}
	[data-primary] {
		background: var(--color-accent);
		color: var(--color-accent-fg);
		border-color: var(--color-accent);
	}
	[role='alert'] {
		color: var(--color-error);
	}
</style>
