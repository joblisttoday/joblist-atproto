<script>
	import ContextMenu from './ContextMenu.svelte';
	import config from '#lib/data/config.json';
	import { ago } from '#lib/i18n/dates.js';
	import { daysLeft, jobPath } from '#lib/records.js';
	import { share } from '#lib/share.js';
	import { deleteRecord } from '#lib/session.svelte.js';
	import { i18n, t } from '#lib/i18n/index.svelte.js';

	/**
	 * An organization's job offers, one row each: its title (its page), where and how, when
	 * posted and how long it is still shown; its "⋯" menu shares it and, for its own account,
	 * changes or deletes it.
	 * @type {{jobs: import('#lib/profile.js').Job[], did: string, own?: boolean, ondeleted?: (rkey: string) => void}}
	 */
	let { jobs, did, own = false, ondeleted } = $props();
	let copied = $state('');

	/** @param {import('#lib/profile.js').Job} job */
	const facts = (job) => [job.place, job.remote && t(`job.remote.${job.remote}`), job.employment && t(`job.employment.${job.employment}`)].filter(Boolean);
	/** @param {import('#lib/profile.js').Job} job */
	const when = (job) =>
		[job.createdAt && t('job.posted', { ago: ago(Date.parse(job.createdAt), i18n.locale) }), job.live && t('job.left', { count: daysLeft(job.expiresAt) })].filter(Boolean);

	/** @param {import('#lib/profile.js').Job} job */
	function actions(job) {
		const path = jobPath(did, job.rkey);
		return [
			{
				label: t('menu.share'),
				icon: /** @type {const} */ ('share'),
				onclick: async () => {
					if ((await share({ title: job.title, url: location.origin + path })) === 'copied') copied = job.rkey;
				}
			},
			...(own
				? [
						{ label: t('profile.edit'), icon: /** @type {const} */ ('edit'), href: `${path}/edit` },
						{ label: t('job.delete'), icon: /** @type {const} */ ('delete'), danger: true, onclick: () => remove(job) }
					]
				: [])
		];
	}

	/** @param {import('#lib/profile.js').Job} job */
	async function remove(job) {
		if (!confirm(t('job.delete.confirm'))) return;
		await deleteRecord(config.collections.job, job.rkey);
		ondeleted?.(job.rkey);
	}
</script>

<ul>
	{#each jobs as job (job.rkey)}
		{@const meta = facts(job)}
		<li data-closed={job.live ? undefined : ''}>
			<div>
				<a href={jobPath(did, job.rkey)}>{job.title}</a>
				{#if meta.length}<span>{meta.join(' · ')}</span>{/if}
				<small>{copied === job.rkey ? t('menu.copied') : when(job).join(' · ')}</small>
			</div>
			<ContextMenu label={t('menu.more')} items={actions(job)} />
		</li>
	{/each}
</ul>

<style>
	ul {
		margin: 0;
		padding: 0;
		list-style: none;
		border: var(--border);
		border-radius: var(--radius-large);
	}
	li {
		position: relative;
		display: flex;
		align-items: center;
		gap: var(--space-s);
		padding: var(--space-s) var(--space-s) var(--space-s) var(--space-m);
	}
	li + li {
		border-top: var(--border);
	}
	li:first-child {
		border-radius: var(--radius-large) var(--radius-large) 0 0;
	}
	li:last-child {
		border-radius: 0 0 var(--radius-large) var(--radius-large);
	}
	li:only-child {
		border-radius: var(--radius-large);
	}
	li:hover {
		background: var(--color-soft);
	}
	div {
		display: grid;
		flex: 1;
		gap: 2px;
		min-width: 0;
	}
	/* The whole row opens the job; its menu stays its own. */
	a {
		font-weight: var(--font-weight-strong);
		text-decoration: none;
		overflow-wrap: anywhere;
	}
	a::after {
		content: '';
		position: absolute;
		inset: 0;
	}
	a:focus-visible {
		outline: none;
	}
	li:has(a:focus-visible) {
		outline: 2px solid var(--color-focus);
		outline-offset: -2px;
	}
	li > :global(jl-context-menu) {
		z-index: 1;
	}
	/* An open menu over the rows after it. */
	li > :global(jl-context-menu:has(> [aria-expanded='true'])) {
		z-index: 2;
	}
	li > :global(jl-context-menu > button) {
		border-color: transparent;
		background: none;
	}
	span {
		font-size: var(--font-size-small);
	}
	small {
		color: var(--color-muted);
	}
	[data-closed] a {
		color: var(--color-muted);
	}
</style>
