<script>
	import Embed from './Embed.svelte';
	import Sheet from './Sheet.svelte';
	import config from '#lib/data/config.json';
	import Icon from './Icon.svelte';
	import ListDelete from './ListDelete.svelte';
	import { goto } from '$app/navigation';
	import { LOCAL, SHARED, sharedPath, toRecord } from '#lib/models/list.js';
	import { feedPath } from '#lib/models/landing.js';
	import { session } from '#lib/auth/session.svelte.js';
	import { newLocalKey, putLocalList } from '#lib/network/local-lists.svelte.js';
	import { handleOf, ownsList } from '#lib/network/network.svelte.js';
	import { t } from '#lib/i18n/index.svelte.js';

	/**
	 * What one can do with a list, in one row: its author edits it and answers suggestions;
	 * others suggest a company (signing in first). Sharing, copying and deleting
	 * are in a small menu at the end.
	 * A list on this device or opened from a link (SHARED) has no address of its own: it is
	 * shared as a link that carries it (sharedPath), and one opened that way can be kept.
	 * suggesting / reviewing: whether "Suggest a company" / the suggestions are open.
	 * @type {{list: import('#lib/models/list.js').List, pending?: number, suggesting?: boolean, reviewing?: boolean}}
	 */
	let { list, pending = 0, suggesting = $bindable(false), reviewing = $bindable(false) } = $props();
	const id = $props.id();

	let copied = $state(false);
	/** @type {ListDelete | undefined} */
	let deleting = $state();
	const mine = $derived(ownsList(list));
	const path = $derived(`/${handleOf(list.did)}/${list.rkey}`);
	// Signed out, "Suggest" signs in first and comes back here with it open.
	const signin = $derived(`/signin?${new URLSearchParams({ next: `${path}?suggest` })}`);
	/** Published: its page. Else the link that carries it, if it fits in one (else it is published to be shared). */
	const carried = $derived(list.did === LOCAL || list.did === SHARED);
	const link = $derived(carried ? sharedPath(list) : window.location.pathname);
	// Its jobs in a feed reader; a list on this device or from a link has no address to follow.
	const feed = $derived(carried ? '' : feedPath({ list: { did: list.did, rkey: list.rkey } }));

	async function share() {
		const url = window.location.origin + link;
		if (navigator.share) {
			await navigator.share({ title: list.name, url }).catch(() => {});
		} else {
			await navigator.clipboard.writeText(url);
			copied = true;
			setTimeout(() => (copied = false), config.layout.copiedMs);
		}
	}

	// A list opened from a link, kept as one's own on this device (private until published).
	async function keep() {
		const rkey = newLocalKey();
		putLocalList(rkey, toRecord({ name: list.name, description: list.description || '', companies: list.companies }));
		await goto(`/${LOCAL}/${rkey}`);
	}

	// The small menu closes, and the dialog says what deleting does.
	function remove() {
		document.getElementById(`${id}-more`)?.hidePopover();
		deleting?.ask();
	}

	// How to show this list's jobs on another website, in a sheet over the list.
	let embedding = $state(false);
	function embed() {
		document.getElementById(`${id}-more`)?.hidePopover();
		embedding = true;
	}
</script>

<svelte:head>{#if feed}<link rel="alternate" type="application/atom+xml" title={t('landing.follow')} href={config.url + feed} />{/if}</svelte:head>

<jl-list-actions>
	<menu aria-label={t('list.actions')}>
		{#if mine}
			{#if pending}
				<li>
					<button type="button" aria-pressed={reviewing} onclick={() => (reviewing = !reviewing)}>
						<Icon name="suggestions" /> {t('list.review')} <small>{pending}</small>
					</button>
				</li>
			{/if}
			<li><a href="{path}/edit"><Icon name="edit" /> {t('list.edit')}</a></li>
		{:else if list.did === SHARED}
			<li><button type="button" onclick={keep}><Icon name="save" /> {t('list.keep')}</button></li>
		{:else if session.did}
			<li>
				<button type="button" aria-pressed={suggesting} onclick={() => (suggesting = !suggesting)}>
					<Icon name="add" /> {t('list.suggest')}
				</button>
			</li>
		{:else if session.ready}
			<li><a href={signin}><Icon name="add" /> {t('list.suggest')}</a></li>
		{/if}
		<!-- Too long to be carried by a link: shared once published (its edit page). -->
		{#if !link}
			<li><a href="{path}/edit" title={t('list.share.publish')}><Icon name="share" label={t('list.share.publish')} /></a></li>
		{:else}
			<li>
				<button type="button" onclick={share} title={copied ? t('list.linkCopied') : t('list.share')}>
					<Icon name={copied ? 'added' : 'share'} label={copied ? t('list.linkCopied') : t('list.share')} />
				</button>
			</li>
		{/if}
		<li>
			<button type="button" popovertarget="{id}-more" title={t('list.more')}><Icon name="more" label={t('list.more')} /></button>
			<menu popover id="{id}-more" aria-label={t('list.more')}>
				{#if list.did !== SHARED}<li><a href="/lists/new?copy={encodeURIComponent(list.uri)}"><Icon name="copy" /> {t('list.copy')}</a></li>{/if}
				{#if feed}<li><a href={feed} type="application/atom+xml" data-sveltekit-reload title={t('landing.follow.help')}><Icon name="feed" /> {t('landing.follow')}</a></li>{/if}
				{#if !carried}<li><button type="button" onclick={embed}><Icon name="embed" /> {t('embed.section')}</button></li>{/if}
				{#if mine}<li><button type="button" onclick={remove}><Icon name="delete" /> {t('list.delete')}</button></li>{/if}
			</menu>
		</li>
	</menu>
	{#if mine}<ListDelete bind:this={deleting} {list} />{/if}
	{#if !carried}
		<Sheet bind:open={embedding} label={t('embed.section')}>
			<Embed attribute="list" value="{list.did}/{list.rkey}" title={t('embed.list.title', { name: list.name })} />
		</Sheet>
	{/if}
</jl-list-actions>

<style>
	jl-list-actions {
		display: block;
	}
	menu {
		flex-wrap: nowrap;
		gap: var(--space-xs);
		margin: 0;
	}
	menu > li > :is(a, button) {
		min-height: var(--chip-height);
		padding: 0 var(--space-m);
		border-radius: var(--radius-round);
		font-size: var(--font-size-small);
		white-space: nowrap;
	}
	/* Icons alone: round. */
	menu > li > button:has(> :global(jl-icon[role='img'])) {
		width: var(--chip-height);
		padding: 0;
	}
	button[aria-pressed='true'] {
		background: var(--color-accent);
		color: var(--color-accent-fg);
		border-color: var(--color-accent);
	}
	small {
		color: inherit;
		opacity: 0.7;
	}
	/* The small menu: under the actions, at the right of the screen. */
	menu[popover] {
		position: fixed;
		inset: auto;
		top: var(--popover-top);
		right: var(--gutter);
	}
	menu[popover]:not(:popover-open) {
		display: none;
	}
	menu[popover]:popover-open {
		flex-direction: column;
		gap: 0;
		padding: var(--space-xs);
		border: var(--border);
		border-radius: var(--radius);
		background: var(--color-bg);
		color: var(--color-fg);
		box-shadow: var(--shadow);
	}
	menu[popover] > li > :is(a, button) {
		display: flex;
		justify-content: flex-start;
		width: 100%;
		min-height: var(--tap-size);
		border: 0;
		border-radius: var(--radius);
		font-size: var(--font-size);
	}
</style>
