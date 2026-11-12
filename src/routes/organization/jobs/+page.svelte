<script>
	import config from '#lib/data/config.json';
	import providers from '#lib/data/providers.json';
	import Icon from '#lib/components/Icon.svelte';
	import MyJobPosts from '#lib/components/MyJobPosts.svelte';
	import { checkBoard } from '#lib/ats/board-check.js';
	import { ATPROTO } from '#lib/models/company.js';
	import { ownOrganization as org } from '#lib/network/own-organization.svelte.js';
	import { formatNumber, t } from '#lib/i18n/index.svelte.js';

	/**
	 * Its job offers: where they come from (its board, read live now, or posted here from its
	 * account), the ones it posted (to edit, renew or close), and posting another.
	 */
	const read = $derived(org.board ? checkBoard(org.board) : null);
	const provider = $derived(org.board ? providers.find((p) => p.id === org.board?.provider)?.name || org.board.provider : '');
</script>

<svelte:head><title>{t('orgs.posts')} · {config.name}</title></svelte:head>

<h1>{t('orgs.posts')}</h1>
{#if org.board}
	<p>
		{t('orgs.from.board', { provider, id: org.board.id })}
		{#await read then found}· {found ? t('orgs.from.read', { count: formatNumber(found.count) }) : t('orgs.from.unread')}{/await}
	</p>
{:else if org.company?.jobBoard?.provider === ATPROTO || org.posts.length}
	<p>{t('orgs.from.here')}</p>
{:else}
	<p><a href="/add?key={encodeURIComponent(org.own)}&field=jobBoard">{t('orgs.field.jobBoard')}</a></p>
{/if}
<menu><a href="/jobs/new" data-primary><Icon name="add" /> {t('post.title')}</a></menu>
{#if org.posts.length}<MyJobPosts posts={org.posts} />{/if}

<style>
	menu {
		margin: var(--space-m) 0;
	}
</style>
