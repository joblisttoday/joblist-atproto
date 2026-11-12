<script>
	import Icon from './Icon.svelte';
	import Row from './Row.svelte';
	import providers from '#lib/data/providers.json';
	import { ATPROTO } from '#lib/models/company.js';
	import { ownOrganization as org } from '#lib/network/own-organization.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * Its own page, to its own account, until its jobs are listed: what to do, in order, each
	 * done or not. Describe it; list its jobs, from its job board (read live, nothing to copy)
	 * or posted here; then, if it likes, show them on its website. Gone once the first two are
	 * done: the page is then what visitors see.
	 */
	const own = $derived(org.own);
	const described = $derived(Boolean(org.company?.description?.trim()));
	const board = $derived(Boolean(org.board) && org.company?.jobBoard?.provider !== ATPROTO);
	const posted = $derived(org.posts.length > 0);
	const listed = $derived(board || posted);
	const names = providers.map((p) => p.name);
	const boards = `${names.slice(0, 4).join(', ')}…`;
	/** @param {boolean} done */
	const chipOf = (done) => (done ? { text: t('setup.done'), tone: /** @type {const} */ ('ok') } : null);
</script>

{#if own && !(described && listed)}
	<jl-org-setup>
		<h2>{t('setup.title')}</h2>
		<p><small>{t('setup.intro', { domain: own })}</small></p>
		<ol>
			<li>
				<Row href="/{own}/edit?all" icon={described ? 'added' : 'edit'} title={t('setup.describe')} meta={[t('setup.describe.meta')]} chip={chipOf(described)} />
			</li>
			<li>
				<jl-org-setup-step>
					<strong><Icon name={listed ? 'added' : 'jobs'} /> {t('setup.jobs')}</strong>
					<small>{t('setup.jobs.meta')}</small>
				</jl-org-setup-step>
				<ul>
					<li><Row href="/{own}/edit?field=jobBoard" icon="feed" title={t('setup.board')} meta={[t('setup.board.meta', { boards })]} chip={chipOf(board)} /></li>
					<li><Row href="/{own}/post" icon="post" title={t('setup.post')} meta={[t('setup.post.meta')]} chip={chipOf(posted)} /></li>
				</ul>
			</li>
			<li>
				<Row href="/{own}/embed" icon="embed" title={t('setup.embed')} meta={[t('setup.embed.meta')]} chip={{ text: t('setup.optional') }} />
			</li>
		</ol>
	</jl-org-setup>
{/if}

<style>
	jl-org-setup {
		display: block;
		margin-top: var(--space-m);
		padding: var(--space-m);
		border: var(--border);
		border-radius: var(--radius-large);
	}
	h2 {
		margin: 0;
		font-size: var(--font-size-large);
	}
	p {
		margin: var(--space-xs) 0 var(--space-s);
		color: var(--color-muted);
	}
	ol,
	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	ol > li:last-child > :global(jl-row) {
		border-bottom: 0;
	}
	jl-org-setup-step {
		display: flex;
		flex-direction: column;
		padding-top: var(--space-s);
	}
	jl-org-setup-step strong {
		display: flex;
		align-items: center;
		gap: var(--space-s);
	}
	jl-org-setup-step small {
		color: var(--color-muted);
	}
	/* Its two ways, under it, set in. */
	ul {
		padding-inline-start: var(--space-l);
		border-bottom: var(--border);
	}
	ul > li:last-child > :global(jl-row) {
		border-bottom: 0;
	}
</style>
